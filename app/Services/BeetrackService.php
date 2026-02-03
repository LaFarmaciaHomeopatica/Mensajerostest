<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class BeetrackService
{
    protected $apiKey;
    protected $baseUrl;

    public function __construct()
    {
        // Using credentials provided by user
        $this->apiKey = "3a36861f3edc3c68d42ad5d3aa72de58e49d22043c102cf22962f77125667556";
        $this->baseUrl = "https://farmaciahom.dispatchtrack.com/api/external/v1/routes";
    }

    public function getDispatchStatus()
    {
        $today = now()->format('d-m-Y');

        try {
            // 1. Get today's routes
            $response = Http::withHeaders([
                'X-AUTH-TOKEN' => $this->apiKey,
            ])->get($this->baseUrl, [
                        'date' => $today,
                    ]);

            if (!$response->successful()) {
                return ['error' => 'Failed to fetch routes', 'details' => $response->body()];
            }

            $rutasRaw = $response->json()['response']['routes'] ?? [];
            $estadoMensajeros = [];

            foreach ($rutasRaw as $r) {
                $idRuta = $r['id'] ?? null;
                $nombre = $r['driver_name'] ?? $r['driver_identifier'] ?? 'Sin Nombre';
                $iniciadaEn = $r['started_at'] ?? null;
                $finalizadaEn = $r['ended_at'] ?? null;

                // Active if started but not ended
                $esActivo = $iniciadaEn !== null && $finalizadaEn === null;

                $gestionadas = 0;
                $total = 0;

                // 2. If active, fetch details for progress (N+1 query as per legacy code)
                if ($esActivo && $idRuta) {
                    try {
                        $detailUrl = "{$this->baseUrl}/{$idRuta}";
                        $detailResp = Http::withHeaders([
                            'X-AUTH-TOKEN' => $this->apiKey,
                        ])->get($detailUrl);

                        if ($detailResp->successful()) {
                            $rutaDetalle = $detailResp->json()['response'] ?? [];
                            $despachos = $rutaDetalle['dispatches'] ?? [];

                            $total = count($despachos);

                            // Count completed, failed, or partial
                            $gestionadas = collect($despachos)->filter(function ($d) {
                                return in_array($d['status'] ?? '', ['completed', 'failed', 'partial']);
                            })->count();
                        }
                    } catch (\Exception $e) {
                        // Keep 0 if sub-request fails
                    }
                }

                $porcentaje = ($total > 0) ? round(($gestionadas / $total) * 100) : 0;

                // Logic to deduplicate or handle multiple routes per driver (taking active one preference)
                if (isset($estadoMensajeros[$nombre]) && $estadoMensajeros[$nombre]['activo'] && !$esActivo) {
                    continue;
                }

                $estadoMensajeros[$nombre] = [
                    'nombre' => $nombre,
                    'unidad' => $r['truck']['identifier'] ?? 'S/U',
                    'activo' => $esActivo,
                    'hora_cierre' => $finalizadaEn ? substr($finalizadaEn, 11, 5) : '', // Extract HH:MM
                    'progreso_str' => "{$gestionadas}/{$total}",
                    'porcentaje' => $porcentaje
                ];
            }

            return [
                'status' => 'success',
                'activos' => collect($estadoMensajeros)->where('activo', true)->values(),
                'libres' => collect($estadoMensajeros)->where('activo', false)->values(),
            ];

        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }
}

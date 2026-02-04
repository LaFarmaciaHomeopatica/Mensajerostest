<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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
        Log::info('BeetrackService: Starting getDispatchStatus');

        // Use caching to prevent hammering the API and improve load times
        return \Illuminate\Support\Facades\Cache::remember('beetrack_status_v2', 120, function () { // Cache for 120 seconds

            $today = now()->format('d-m-Y');
            Log::info("BeetrackService: Fetching for date: {$today} (Fresh Cache)");

            try {
                // 1. Get today's routes
                $response = Http::timeout(15)->withHeaders([
                    'X-AUTH-TOKEN' => $this->apiKey,
                ])->get($this->baseUrl, [
                            'date' => $today,
                        ]);

                if (!$response->successful()) {
                    Log::error("Beetrack API Error: " . $response->body());
                    return ['status' => 'error', 'message' => 'API Error or Timeout', 'details' => $response->body()];
                }

                $rutasRaw = $response->json()['response']['routes'] ?? [];
                Log::info('Beetrack Raw Routes Count: ' . count($rutasRaw));

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
                    // Note: This adds overhead. We might want to limit parallel requests or cache deeper.
                    if ($esActivo && $idRuta) {
                        try {
                            $detailUrl = "{$this->baseUrl}/{$idRuta}";
                            $detailResp = Http::timeout(10)->withHeaders([ // shorter timeout for sub-requests
                                'X-AUTH-TOKEN' => $this->apiKey,
                            ])->get($detailUrl);

                            if ($detailResp->successful()) {
                                $wrapper = $detailResp->json()['response'] ?? [];
                                // API structure: response -> route -> dispatches (or sometimes direct dispatches depending on endpoint version)
                                $rutaDetalle = $wrapper['route'] ?? $wrapper;
                                $despachos = $rutaDetalle['dispatches'] ?? [];

                                $total = count($despachos);
                                $gestionadas = collect($despachos)->filter(fn($d) => in_array($d['status'] ?? '', ['completed', 'failed', 'partial', 'delivered']))->count();
                            }
                        } catch (\Exception $e) {
                            Log::warning("Beetrack Detail Error for Route {$idRuta}: " . $e->getMessage());
                        }
                    }

                    $porcentaje = ($total > 0) ? round(($gestionadas / $total) * 100) : 0;

                    if (isset($estadoMensajeros[$nombre]) && $estadoMensajeros[$nombre]['activo'] && !$esActivo) {
                        continue;
                    }

                    $estadoMensajeros[$nombre] = [
                        'nombre' => $nombre,
                        'unidad' => $r['truck']['identifier'] ?? 'S/U',
                        'activo' => $esActivo,
                        'hora_cierre' => $finalizadaEn ? substr($finalizadaEn, 11, 5) : '',
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
                Log::error("Beetrack Service Exception: " . $e->getMessage());
                return ['status' => 'error', 'message' => $e->getMessage()];
            }
        });
    }


}

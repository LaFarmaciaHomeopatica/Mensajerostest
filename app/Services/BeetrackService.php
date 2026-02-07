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
        return \Illuminate\Support\Facades\Cache::remember('beetrack_status_v3', 120, function () { // Cache for 120 seconds

            $today = now()->format('d-m-Y');
            Log::info("BeetrackService: Fetching for date: {$today} (Fresh Cache)");

            try {
                // 1. Get today's routes
                $response = Http::timeout(45)->withHeaders([
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
                    // Optimization: Use a secondary cache for route details to avoid redundant API calls
                    if ($esActivo && $idRuta) {
                        $cacheKey = "beetrack_route_detail_{$idRuta}";
                        $details = \Illuminate\Support\Facades\Cache::remember($cacheKey, 300, function () use ($idRuta) {
                            try {
                                $detailUrl = "{$this->baseUrl}/{$idRuta}";
                                $detailResp = Http::timeout(10)->withHeaders([
                                    'X-AUTH-TOKEN' => $this->apiKey,
                                ])->get($detailUrl);

                                if ($detailResp->successful()) {
                                    return $detailResp->json()['response'] ?? [];
                                }
                            } catch (\Exception $e) {
                                Log::warning("Beetrack Detail Error for Route {$idRuta}: " . $e->getMessage());
                            }
                            return null;
                        });

                        if ($details) {
                            $rutaDetalle = $details['route'] ?? $details;
                            $despachos = $rutaDetalle['dispatches'] ?? [];
                            $total = count($despachos);

                            $gestionadas = collect($despachos)->filter(fn($d) => in_array($d['status'] ?? '', ['completed', 'failed', 'partial', 'delivered']))->count();

                            // Detailed Metrics
                            $successful = collect($despachos)->filter(fn($d) => in_array($d['status'] ?? '', ['completed', 'delivered']))->count();
                            $failed = collect($despachos)->filter(fn($d) => in_array($d['status'] ?? '', ['failed', 'partial']))->count();
                            // Determine on-time based on delivery window if available (simplified for now)
                            // $onTime = ... 
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
                        'porcentaje' => $porcentaje,
                        'metrics' => [
                            'total' => $total,
                            'completed' => $gestionadas, // 'completed' here means processed/managed
                            'successful' => $successful ?? 0,
                            'failed' => $failed ?? 0,
                            'routes_count' => 1 // Each item in $rutasRaw is a route
                        ]
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

    public function createDispatch(array $data)
    {
        try {
            // Beetrack API endpoint for creating dispatches
            // Note: This is a placeholder - actual endpoint may vary
            $createUrl = str_replace('/routes', '/dispatches', $this->baseUrl);

            $payload = [
                'identifier' => $data['guide'],
                'contact_name' => $data['contact_name'],
                'contact' => $data['contact_name'],
                'contact_phone' => $data['contact_phone'] ?: '0',
                'phone' => $data['contact_phone'] ?: '0',
                'contact_email' => $data['contact_email'] ?? '',
                'email' => $data['contact_email'] ?? '',
                'contact_identifier' => $data['contact_identifier'] ?? '',
                'contact_id' => $data['contact_identifier'] ?? '',
                'vat_number' => $data['contact_identifier'] ?? '',
                'address' => ($data['address'] ?? '') . ', ' . ($data['city'] ?? 'BOGOTA') . ', Colombia',
                'contact_address' => ($data['address'] ?? '') . ', ' . ($data['city'] ?? 'BOGOTA') . ', Colombia',
                'city' => $data['city'] ?? 'BOGOTA',
                'lat' => $data['latitude'] ?? '',
                'lng' => $data['longitude'] ?? '',
                'latitude' => $data['latitude'] ?? '',
                'longitude' => $data['longitude'] ?? '',
                'min_delivery_time' => $data['min_delivery_at'] ? date('Y-m-d H:i:s', strtotime($data['min_delivery_at'])) : '',
                'max_delivery_time' => $data['max_delivery_at'] ? date('Y-m-d H:i:s', strtotime($data['max_delivery_at'])) : '',
                'notes' => $data['description'] ?? '',
                'description' => $data['description'] ?? '',

                // --- CUSTOM FIELDS SHOTGUN ---

                // 1. Standard Beetrack fields array (try multiple casings)
                'fields' => [
                    ['name' => 'Prioridad', 'value' => $data['priority'] ?? 'Normal'],
                    ['name' => 'INFO', 'value' => $data['observations'] ?? ''],
                    ['name' => 'prioridad', 'value' => $data['priority'] ?? 'Normal'],
                    ['name' => 'info', 'value' => $data['observations'] ?? ''],
                    ['name' => 'PRIORIDAD', 'value' => $data['priority'] ?? 'Normal'],
                ],

                // 2. custom_fields array variant
                'custom_fields' => [
                    ['name' => 'Prioridad', 'value' => $data['priority'] ?? 'Normal'],
                    ['name' => 'INFO', 'value' => $data['observations'] ?? ''],
                ],

                // 3. custom_attributes object variant (Case sensitive matching is common here)
                'custom_attributes' => [
                    'Prioridad' => $data['priority'] ?? 'Normal',
                    'INFO' => $data['observations'] ?? '',
                    'prioridad' => $data['priority'] ?? 'Normal',
                    'info' => $data['observations'] ?? '',
                ],

                // 4. Root level attributes (fallback for some v1 endpoints)
                'Prioridad' => $data['priority'] ?? 'Normal',
                'INFO' => $data['observations'] ?? '',
                'prioridad' => $data['priority'] ?? 'Normal',
                'info' => $data['observations'] ?? '',

                'items' => [
                    [
                        'name' => $data['item_name'] ?? 'RECOGER',
                        'quantity' => $data['item_quantity'] ?? 1,
                        'code' => $data['item_code'] ?? '',
                        // 5. Item Extras variant
                        'extras' => [
                            ['name' => 'Prioridad', 'value' => $data['priority'] ?? 'Normal'],
                            ['name' => 'INFO', 'value' => $data['observations'] ?? ''],
                            ['name' => 'prioridad', 'value' => $data['priority'] ?? 'Normal'],
                            ['name' => 'info', 'value' => $data['observations'] ?? ''],
                        ]
                    ]
                ],
                'date' => now()->format('Y-m-d'),
            ];

            // Forced logging to the main log file
            Log::channel('single')->info('BEETRACK ATTEMPT - GUID: ' . $data['guide'], ['payload' => $payload]);

            // Emergency Logging to a file we can definitely read
            $debugData = [
                'timestamp' => now()->toIso8601String(),
                'url' => $createUrl,
                'payload' => $payload
            ];
            file_put_contents('/tmp/beetrack_sync_debug.json', json_encode($debugData, JSON_PRETTY_PRINT));
            chmod('/tmp/beetrack_sync_debug.json', 0666);

            $response = Http::timeout(45)->withHeaders([
                'X-AUTH-TOKEN' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post($createUrl, $payload);

            $debugData['response_status'] = $response->status();
            $debugData['response_body'] = $response->json() ?: $response->body();
            file_put_contents('/tmp/beetrack_sync_debug.json', json_encode($debugData, JSON_PRETTY_PRINT));

            if ($response->successful()) {
                $result = $response->json();
                Log::info('BeetrackService: Dispatch created successfully', $result);

                return [
                    'success' => true,
                    'dispatch_id' => $result['response']['id'] ?? null,
                    'data' => $result
                ];
            } else {
                Log::error('BeetrackService: Failed to create dispatch', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                return [
                    'success' => false,
                    'message' => 'Error en la API de Beetrack: ' . $response->status()
                ];
            }
        } catch (\Exception $e) {
            Log::error('BeetrackService: Exception creating dispatch', [
                'message' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    public function clearCache()
    {
        \Illuminate\Support\Facades\Cache::forget('beetrack_status_v3');
        \Illuminate\Support\Facades\Log::info('BeetrackService: Cache cleared manually');
    }
}

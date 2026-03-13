<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Procedure;
use App\Models\Messenger;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ProcedureController extends Controller
{
    public function index(Request $request)
    {
        $query = Procedure::query();
        $perPage = $request->input('per_page', 30);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date')) {
            $query->whereDate('start_date', $request->date);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('guide', 'like', '%' . $request->search . '%')
                    ->orWhere('product', 'like', '%' . $request->search . '%')
                    ->orWhere('contact_name', 'like', '%' . $request->search . '%')
                    ->orWhere('phone', 'like', '%' . $request->search . '%');
            });
        }

        return Inertia::render('Procedures/Index', [
            'procedures' => $query->latest()->paginate($perPage)->withQueryString(),
            'messengers' => Messenger::where('is_active', true)->get(),
            'filters' => $request->only(['status', 'date', 'search', 'per_page']),
            'stats' => [
                'total' => Procedure::count(),
                'pendiente' => Procedure::where('status', 'pendiente')->count(),
                'en_ruta' => Procedure::where('status', 'en_ruta')->count(),
                'completado' => Procedure::where('status', 'completado')->count(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'guide' => 'nullable|string',
            'product' => 'nullable|string',
            'quantity' => 'nullable|string',
            'client_id' => 'nullable|string',
            'contact_name' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|string',
            'address' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'priority' => 'nullable|string',
            'info' => 'nullable|string',
            'management_notes' => 'nullable|string',
            'messenger_id' => 'nullable|exists:messengers,id',
        ]);

        // Auto-generación de guía si no se proporciona
        if (empty($validated['guide'])) {
            $lastProcedure = Procedure::where('guide', 'like', 'TRAMITE%')
                ->orderByRaw('CAST(SUBSTRING(guide, 8) AS UNSIGNED) DESC')
                ->first();

            if ($lastProcedure) {
                $lastNumber = intval(substr($lastProcedure->guide, 7));
                $nextNumber = $lastNumber + 1;
            } else {
                $nextNumber = 1;
            }
            $validated['guide'] = 'TRAMITE' . $nextNumber;
        }

        Procedure::create([
            ...$validated,
            'user_id' => auth()->id(),
            'status' => 'pendiente',
        ]);

        return redirect()->back()->with('success', 'Trámite ' . $validated['guide'] . ' registrado correctamente.');
    }

    public function update(Request $request, Procedure $procedure)
    {
        $validated = $request->validate([
            'guide' => 'nullable|string',
            'product' => 'nullable|string',
            'quantity' => 'nullable|string',
            'client_id' => 'nullable|string',
            'contact_name' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|string',
            'address' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'priority' => 'nullable|string',
            'info' => 'nullable|string',
            'management_notes' => 'nullable|string',
            'messenger_id' => 'nullable|exists:messengers,id',
            'status' => 'required|string',
        ]);

        $procedure->update($validated);

        return redirect()->back()->with('success', 'Trámite actualizado correctamente.');
    }

    public function destroy(Procedure $procedure)
    {
        $procedure->delete();
        return redirect()->back()->with('success', 'Trámite eliminado correctamente.');
    }

    public function export(Request $request)
    {
        $ids = $request->input('ids', []);
        $query = Procedure::query();

        if (!empty($ids)) {
            $query->whereIn('id', $ids);
        } else {
            $query->where('status', 'pendiente');
        }

        $procedures = $query->with('messenger')->get();

        $processed = $procedures->map(function ($p) {
            return [
                'guia' => $p->guide ?? '',
                'vehiculo' => $p->messenger ? strtoupper($p->messenger->vehicle) : 'SIN-PLACA',
                'producto' => $p->product ?? '',
                'cantidad' => $p->quantity ?? '1',
                'codigop' => '',
                'identificacion' => $p->client_id ?? '',
                'contacto' => $p->contact_name ?? '',
                'telefono' => $p->phone ?? '',
                'email' => $p->email ?? '',
                'direccion' => $p->address ?? '',
                'latitud' => '',
                'longitud' => '',
                'horainicio' => $p->start_date ? \Carbon\Carbon::parse($p->start_date)->format('Y/m/d H:i') : '',
                'horafinal' => $p->end_date ? \Carbon\Carbon::parse($p->end_date)->format('Y/m/d H:i') : '',
                'ctdestino' => '',
                'prioridad' => $p->priority ?? 'Normal',
                'info' => $p->info ?? '',
            ];
        });

        return Excel::download(
            new class ($processed) implements FromCollection, WithHeadings {
            private $data;
            public function __construct($data)
            {
                $this->data = collect($data);
            }
            public function collection()
            {
                return $this->data;
            }
            public function headings(): array
            {
                return ['guia', 'vehiculo', 'producto', 'cantidad', 'codigop', 'identificacion', 'contacto', 'telefono', 'email', 'direccion', 'latitud', 'longitud', 'horainicio', 'horafinal', 'ctdestino', 'prioridad', 'info'];
            }
            },
            'tramites_beetrack_' . now()->format('Ymd_His') . '.xlsx'
        );
    }

    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:procedures,id',
            'status' => 'nullable|string',
            'messenger_id' => 'nullable|exists:messengers,id',
        ]);

        $updateData = [];
        if (isset($validated['status']))
            $updateData['status'] = $validated['status'];
        if (isset($validated['messenger_id']))
            $updateData['messenger_id'] = $validated['messenger_id'];

        if (!empty($updateData)) {
            Procedure::whereIn('id', $validated['ids'])->update($updateData);
        }

        return redirect()->back()->with('success', count($validated['ids']) . ' trámites actualizados correctamente.');
    }
}

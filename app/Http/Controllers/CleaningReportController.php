<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CleaningReport;
use App\Models\Messenger;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\CleaningReportsExport;

class CleaningReportController extends Controller
{
    public function create()
    {
        return Inertia::render('Landing', [
            'preoperationalQuestions' => \App\Models\PreoperationalQuestion::where('active', true)->orderBy('order')->get(),
            'isCleaningPath' => true
        ]);
    }

    public function index(Request $request)
    {
        $query = CleaningReport::with('messenger');

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        if ($sortBy === 'messenger_name') {
            $query->join('messengers', 'cleaning_reports.messenger_id', '=', 'messengers.id')
                ->select('cleaning_reports.*')
                ->orderBy('messengers.name', $sortOrder);
        } elseif ($sortBy === 'vehicle') {
            $query->join('messengers', 'cleaning_reports.messenger_id', '=', 'messengers.id')
                ->select('cleaning_reports.*')
                ->orderBy('messengers.vehicle', $sortOrder);
        } else {
            $query->orderBy('cleaning_reports.' . $sortBy, $sortOrder);
        }

        // Filters
        if ($request->has('date') && $request->date !== '') {
            $query->whereDate('cleaning_reports.created_at', $request->date);
        }

        if ($request->has('messenger_id') && $request->messenger_id !== '') {
            $query->where('cleaning_reports.messenger_id', $request->messenger_id);
        }

        if ($request->has('type') && $request->type !== '') {
            $query->where('cleaning_reports.type', $request->type);
        }

        $reports = $query->paginate(20);

        return Inertia::render('Reports/Cleaning', [
            'reports' => $reports,
            'messengers' => Messenger::orderBy('name')->get(),
            'filters' => $request->only(['date', 'messenger_id', 'type', 'sort_by', 'sort_order'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'messenger_id' => 'required|exists:messengers,id',
            'type' => 'required|in:maletas_semanal,maletas_mensual,motos_semanal,motos_mensual',
            'answers' => 'required|array',
            'evidence' => 'required|image|max:5120', // 5MB max
            'observations' => 'nullable|string',
        ]);

        $messenger = Messenger::findOrFail($request->messenger_id);

        if (!$messenger->is_active) {
            return back()->withErrors(['messenger_inactive' => 'Tu usuario está inactivo.']);
        }

        // Store image
        $path = $request->file('evidence')->store('cleaning_evidence', 'public');

        CleaningReport::create([
            'messenger_id' => $messenger->id,
            'type' => $request->type,
            'answers' => $request->answers,
            'evidence_path' => $path,
            'observations' => $request->observations,
        ]);

        return back()->with('success', [
            'message' => '¡Reporte de limpieza enviado exitosamente!',
            'messenger_name' => $messenger->name,
        ]);
    }

    public function export(Request $request)
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $messengerId = $request->get('messenger_id');
        $type = $request->get('type');

        if (!$startDate || !$endDate) {
            return back()->withErrors(['export' => 'Las fechas son obligatorias para exportar.']);
        }

        return Excel::download(
            new CleaningReportsExport($startDate, $endDate, $messengerId, $type),
            'reportes_limpieza_' . now()->format('Y-m-d_His') . '.xlsx'
        );
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PreoperationalReport;
use App\Models\Messenger;
use Inertia\Inertia;
use App\Exports\PreoperationalReportsExport;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\DispatchLocation;

class PreoperationalController extends Controller
{
    public function index(Request $request)
    {
        $query = PreoperationalReport::with('messenger');

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        if ($sortBy === 'messenger_name') {
            $query->join('messengers', 'preoperational_reports.messenger_id', '=', 'messengers.id')
                ->select('preoperational_reports.*')
                ->orderBy('messengers.name', $sortOrder);
        } elseif ($sortBy === 'vehicle') {
            $query->join('messengers', 'preoperational_reports.messenger_id', '=', 'messengers.id')
                ->select('preoperational_reports.*')
                ->orderBy('messengers.vehicle', $sortOrder);
        } else {
            $query->orderBy('preoperational_reports.' . $sortBy, $sortOrder);
        }

        // Filter by date if provided
        if ($request->has('date') && $request->date !== '') {
            $query->whereDate('preoperational_reports.created_at', $request->date);
        }

        // Filter by messenger if provided
        if ($request->has('messenger_id') && $request->messenger_id !== '') {
            $query->where('preoperational_reports.messenger_id', $request->messenger_id);
        }

        // Filter by location if provided
        if ($request->has('location') && $request->location !== '') {
            $location = $request->location;
            $query->whereExists(function ($q) use ($location) {
                $q->select(\Illuminate\Support\Facades\DB::raw(1))
                    ->from('shifts')
                    ->whereColumn('shifts.messenger_id', 'preoperational_reports.messenger_id')
                    ->whereRaw('DATE(shifts.date) = DATE(preoperational_reports.created_at)')
                    ->where('shifts.location', $location);
            });
        }

        $reports = $query->paginate(20);

        // Enrich reports with shift data and compliance
        $reports->getCollection()->transform(function ($report) {
            // Find shift for the same date
            $shift = \App\Models\Shift::where('messenger_id', $report->messenger_id)
                ->whereDate('date', $report->created_at)
                ->first();

            $report->shift = $shift;

            // Calculate compliance (report submitted before shift start)
            if ($shift) {
                $reportTime = \Carbon\Carbon::parse($report->created_at);
                $shiftDateTime = \Carbon\Carbon::parse($shift->date . ' ' . $shift->start_time);
                $report->compliant = $reportTime->lessThan($shiftDateTime);
            } else {
                $report->compliant = null; // No shift found
            }

            return $report;
        });

        $messengers = Messenger::orderBy('name')->get();
        $questions = \App\Models\PreoperationalQuestion::orderBy('order')->get();

        return Inertia::render('Reports/Preoperational', [
            'reports' => $reports,
            'messengers' => $messengers,
            'questions' => $questions,
            'locations' => DispatchLocation::all(),
            'filters' => $request->only(['date', 'messenger_id', 'location', 'sort_by', 'sort_order'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'messenger_id' => 'required|exists:messengers,id',
            'answers' => 'required|array',
            'observations' => 'nullable|string',
        ]);

        $messenger = Messenger::findOrFail($request->messenger_id);

        if (!$messenger->is_active) {
            return back()->withErrors(['messenger_inactive' => 'Tu usuario está inactivo.']);
        }

        // Check if already submitted today
        $existingReport = PreoperationalReport::where('messenger_id', $messenger->id)
            ->whereDate('created_at', today())
            ->first();

        if ($existingReport) {
            return back()->withErrors([
                'preop_duplicate' => 'Ya has enviado tu reporte preoperacional hoy.'
            ]);
        }

        PreoperationalReport::create([
            'messenger_id' => $messenger->id,
            'answers' => $request->answers,
            'observations' => $request->observations,
        ]);

        return back()->with('success', [
            'message' => '¡Reporte preoperacional enviado exitosamente!',
            'messenger_name' => $messenger->name,
        ]);
    }

    public function export(Request $request)
    {
        // dd($request->all()); // Descomenta esto para probar si llega aquí
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'messenger_id' => 'nullable|exists:messengers,id',
            'location' => 'nullable|string',
        ]);

        $fileName = 'reporte_preoperacional_' . now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(
            new PreoperationalReportsExport(
                $request->start_date,
                $request->end_date,
                $request->messenger_id,
                $request->location
            ),
            $fileName
        );
    }
}

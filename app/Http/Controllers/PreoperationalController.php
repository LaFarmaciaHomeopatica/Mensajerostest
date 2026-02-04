<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PreoperationalReport;
use App\Models\Messenger;
use Inertia\Inertia;
use App\Exports\PreoperationalReportsExport;
use Maatwebsite\Excel\Facades\Excel;

class PreoperationalController extends Controller
{
    public function index(Request $request)
    {
        $query = PreoperationalReport::with('messenger')
            ->orderBy('created_at', 'desc');

        // Filter by date if provided
        if ($request->has('date')) {
            $query->whereDate('created_at', $request->date);
        }

        // Filter by messenger if provided
        if ($request->has('messenger_id')) {
            $query->where('messenger_id', $request->messenger_id);
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

        return Inertia::render('Reports/Preoperational', [
            'reports' => $reports,
            'messengers' => $messengers,
            'filters' => $request->only(['date', 'messenger_id'])
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
        ]);

        $fileName = 'reporte_preoperacional_' . now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(
            new PreoperationalReportsExport(
                $request->start_date,
                $request->end_date,
                $request->messenger_id
            ),
            $fileName
        );
    }
}

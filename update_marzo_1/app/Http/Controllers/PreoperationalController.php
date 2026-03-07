<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PreoperationalQuestion;
use App\Models\PreoperationalReport;
use App\Models\Messenger;
use App\Exports\PreoperationalReportsExport;
use Maatwebsite\Excel\Facades\Excel;
use Inertia\Inertia;
use Carbon\Carbon;

class PreoperationalController extends Controller
{
    /**
     * API: Get active questions for the messenger landing page.
     */
    public function getQuestions()
    {
        $questions = PreoperationalQuestion::where('active', true)
            ->orderBy('order')
            ->get(['id', 'category', 'label', 'key']);

        return response()->json(['questions' => $questions]);
    }

    /**
     * Store new preoperational report from messenger landing page.
     */
    public function store(Request $request)
    {
        $request->validate([
            'messenger_id' => 'required|exists:messengers,id',
            'answers' => 'required|array',
            'observations' => 'nullable|string',
        ]);

        $messenger = Messenger::findOrFail($request->messenger_id);

        if (!$messenger->is_active) {
            return response()->json(['error' => 'Tu usuario está inactivo.'], 403);
        }

        // Optional: Check if already submitted today? 
        $existsToday = PreoperationalReport::where('messenger_id', $messenger->id)
            ->whereDate('created_at', today())
            ->exists();

        if ($existsToday) {
            return response()->json(['error' => 'Ya has registrado tu preoperacional el día de hoy.'], 403);
        }

        PreoperationalReport::create([
            'messenger_id' => $messenger->id,
            'answers' => $request->answers,
            'observations' => $request->observations,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reporte preoperacional enviado correctamente.'
        ]);
    }

    /**
     * View for Leaders/Admins to see all reports.
     */
    public function report(Request $request)
    {
        $date = $request->input('date', today()->toDateString());

        return Inertia::render('Reports/Preoperational', [
            'filters' => ['start_date' => $date, 'end_date' => $date],
            'messengers' => Messenger::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * API: Get data for the datatable.
     */
    public function data(Request $request)
    {
        $query = PreoperationalReport::with('messenger')
            ->whereHas('messenger', fn($q) => $q->where('is_active', true))
            ->orderBy('created_at', 'desc');

        if ($request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $logs = $query->get()->map(function ($log) {
            $shift = $log->messenger->shifts()
                ->where('date', $log->created_at->toDateString())
                ->where('status', '!=', 'absent')
                ->where('status', '!=', 'no_shift')
                ->first();

            $onTime = 'Sin Turno';
            if ($shift) {
                $shiftStart = Carbon::parse($shift->date . ' ' . $shift->start_time);
                if ($log->created_at->lte($shiftStart)) {
                    $onTime = 'A Tiempo';
                } else {
                    $onTime = 'No';
                }
            }

            $yesCount = 0;
            $noCount = 0;
            if (is_array($log->answers)) {
                foreach ($log->answers as $ans) {
                    if ($ans === true || $ans === 'si' || $ans === 'bueno' || $ans === 'SÍ')
                        $yesCount++;
                    else if ($ans === false || $ans === 'no' || $ans === 'malo' || $ans === 'NO')
                        $noCount++;
                }
            }

            return [
                'id' => $log->id,
                'messenger' => $log->messenger->name ?? 'Desconocido',
                'vehicle' => $log->messenger->vehicle ?? 'N/A',
                'date' => $log->created_at->format('d/m/Y'),
                'time' => $log->created_at->format('H:i:s'),
                'on_time' => $onTime,
                'yes_count' => $yesCount,
                'no_count' => $noCount,
                'answers' => $log->answers,
                'observations' => $log->observations,
            ];
        });

        return response()->json(['logs' => $logs]);
    }

    /**
     * Export to Excel
     */
    public function export(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $fileName = 'preoperacionales_' . now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(
            new PreoperationalReportsExport(
                $request->start_date,
                $request->end_date
            ),
            $fileName
        );
    }

    /**
     * View for Analytics
     */
    public function statsView(Request $request)
    {
        $date = $request->input('date', today()->toDateString());
        return Inertia::render('Reports/PreoperationalStats', [
            'filters' => [
                'start_date' => $date,
                'end_date' => $date,
                'messenger_id' => $request->input('messenger_id', '')
            ],
            'messengers' => Messenger::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * API for Analytics Dashboard
     */
    public function statsData(Request $request)
    {
        $query = PreoperationalReport::with('messenger')
            ->whereHas('messenger', fn($q) => $q->where('is_active', true));

        $shiftsQuery = \App\Models\Shift::where('status', '!=', 'absent')
            ->where('status', '!=', 'no_shift');

        if ($request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
            $shiftsQuery->whereDate('date', '>=', $request->start_date);
        }
        if ($request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
            $shiftsQuery->whereDate('date', '<=', $request->end_date);
        }
        if ($request->messenger_id) {
            $query->where('messenger_id', $request->messenger_id);
            $shiftsQuery->where('messenger_id', $request->messenger_id);
        } else {
            $shiftsQuery->whereHas('messenger', fn($q) => $q->where('is_active', true));
        }

        $reports = $query->get();
        $totalReports = $reports->count();
        $totalWithIssues = 0;
        $totalFlawless = 0;

        $shifts = $shiftsQuery->get();
        $workedDays = $shifts->count();
        $shiftsByKey = $shifts->keyBy(fn($s) => $s->messenger_id . '_' . $s->date);

        $onTimeCount = 0;

        $issuesByCategory = [];
        $issuesByKey = [];

        // Traer preguntas activas para etiquetamiento
        $questions = PreoperationalQuestion::where('active', true)->get()->keyBy('key');

        $reports->each(function ($log) use (&$totalWithIssues, &$totalFlawless, &$issuesByCategory, &$issuesByKey, $questions, &$onTimeCount, $shiftsByKey) {
            $hasIssues = false;

            $shiftKey = $log->messenger_id . '_' . $log->created_at->toDateString();
            if ($shiftsByKey->has($shiftKey)) {
                $shift = $shiftsByKey[$shiftKey];
                $shiftStart = \Carbon\Carbon::parse($shift->date . ' ' . $shift->start_time);
                if ($log->created_at->lte($shiftStart)) {
                    $onTimeCount++;
                }
            }

            if (is_array($log->answers)) {
                foreach ($log->answers as $key => $ans) {
                    // Si contestó Molo / Falso / No
                    if ($ans === false || $ans === 'no' || $ans === 'malo' || $ans === 'NO') {
                        $hasIssues = true;

                        $qLabel = $questions->has($key) ? $questions[$key]->label : $key;
                        $qCategory = $questions->has($key) ? $questions[$key]->category : 'Otros';

                        if (!isset($issuesByKey[$qLabel]))
                            $issuesByKey[$qLabel] = 0;
                        $issuesByKey[$qLabel]++;

                        if (!isset($issuesByCategory[$qCategory]))
                            $issuesByCategory[$qCategory] = 0;
                        $issuesByCategory[$qCategory]++;
                    }
                }
            }

            if ($hasIssues) {
                $totalWithIssues++;
            } else {
                $totalFlawless++;
            }
        });

        arsort($issuesByKey);
        arsort($issuesByCategory);

        return response()->json([
            'metrics' => [
                'total_inspections' => $totalReports,
                'total_flawless' => $totalFlawless,
                'total_with_issues' => $totalWithIssues,
                'flawless_percentage' => $totalReports > 0 ? round(($totalFlawless / $totalReports) * 100, 1) : 0,
                'worked_days' => $workedDays,
                'on_time_count' => $onTimeCount,
                'on_time_percentage' => $workedDays > 0 ? round(($onTimeCount / $workedDays) * 100, 1) : 0,
            ],
            'issues_by_key' => array_slice($issuesByKey, 0, 5, true), // Top 5
            'issues_by_category' => $issuesByCategory
        ]);
    }

    public function questionsView()
    {
        $questions = PreoperationalQuestion::orderBy('order')->get();
        return Inertia::render('Reports/PreoperationalQuestions', [
            'questions' => $questions
        ]);
    }

    public function storeQuestion(Request $request)
    {
        $request->validate([
            'category' => 'required|string',
            'label' => 'required|string',
            'key' => 'required|string|unique:preoperational_questions,key',
            'active' => 'boolean',
            'order' => 'integer'
        ]);

        PreoperationalQuestion::create($request->all());
        return redirect()->back()->with('success', 'Pregunta creada correctamente.');
    }

    public function updateQuestion(Request $request, $id)
    {
        $question = PreoperationalQuestion::findOrFail($id);
        $request->validate([
            'category' => 'required|string',
            'label' => 'required|string',
            'key' => 'required|string|unique:preoperational_questions,key,' . $question->id,
            'active' => 'boolean',
            'order' => 'integer'
        ]);

        $question->update($request->all());
        return redirect()->back()->with('success', 'Pregunta actualizada correctamente.');
    }

    public function destroyQuestion($id)
    {
        $question = PreoperationalQuestion::findOrFail($id);
        $question->delete();
        return redirect()->back()->with('success', 'Pregunta eliminada correctamente.');
    }
}

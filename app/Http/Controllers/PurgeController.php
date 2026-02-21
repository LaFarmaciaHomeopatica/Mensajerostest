<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\LunchLog;
use App\Models\ShiftCompletion;
use App\Models\Shift;
use App\Exports\PurgeBackupExport;
use Maatwebsite\Excel\Facades\Excel;

class PurgeController extends Controller
{
    /**
     * Returns counts of records matching the date range and table selection.
     */
    public function preview(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'tables' => 'required|array|min:1',
            'tables.*' => 'in:lunch_logs,shift_completions,shifts',
        ]);

        $tables = $request->tables;
        $start = $request->start_date;
        $end = $request->end_date;
        $counts = [];
        $totalBytes = 0;

        if (in_array('lunch_logs', $tables)) {
            $counts['lunch_logs'] = LunchLog::whereDate('start_time', '>=', $start)
                ->whereDate('start_time', '<=', $end)->count();
        }
        if (in_array('shift_completions', $tables)) {
            $counts['shift_completions'] = ShiftCompletion::whereDate('finished_at', '>=', $start)
                ->whereDate('finished_at', '<=', $end)->count();
        }
        if (in_array('shifts', $tables)) {
            $counts['shifts'] = Shift::whereDate('date', '>=', $start)
                ->whereDate('date', '<=', $end)->count();
        }

        return response()->json([
            'counts' => $counts,
            'total' => array_sum($counts),
        ]);
    }

    /**
     * Streams a multi-sheet Excel backup of the matching rows.
     */
    public function backup(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'tables' => 'required|array|min:1',
            'tables.*' => 'in:lunch_logs,shift_completions,shifts',
        ]);

        $fileName = 'respaldo_depuracion_' . now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(
            new PurgeBackupExport($request->start_date, $request->end_date, $request->tables),
            $fileName
        );
    }

    /**
     * Verifies the user's password without executing anything (Step 3).
     */
    public function verifyPassword(Request $request)
    {
        $request->validate(['password' => 'required|string']);

        if (!Hash::check($request->password, Auth::user()->password)) {
            return response()->json(['error' => 'Contraseña incorrecta.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    /**
     * Executes the purge after verifying the user's password.
     */
    public function execute(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'tables' => 'required|array|min:1',
            'tables.*' => 'in:lunch_logs,shift_completions,shifts',
            'password' => 'required|string',
            'confirmation' => 'required|in:ELIMINAR',
        ]);

        // Verify current user's password
        if (!Hash::check($request->password, Auth::user()->password)) {
            return response()->json(['error' => 'Contraseña incorrecta.'], 422);
        }

        $tables = $request->tables;
        $start = $request->start_date;
        $end = $request->end_date;
        $deleted = [];

        if (in_array('lunch_logs', $tables)) {
            $deleted['lunch_logs'] = LunchLog::whereDate('start_time', '>=', $start)
                ->whereDate('start_time', '<=', $end)->delete();
        }
        if (in_array('shift_completions', $tables)) {
            $deleted['shift_completions'] = ShiftCompletion::whereDate('finished_at', '>=', $start)
                ->whereDate('finished_at', '<=', $end)->delete();
        }
        if (in_array('shifts', $tables)) {
            $deleted['shifts'] = Shift::whereDate('date', '>=', $start)
                ->whereDate('date', '<=', $end)->delete();
        }

        return response()->json([
            'success' => true,
            'deleted' => $deleted,
            'total' => array_sum($deleted),
        ]);
    }
}

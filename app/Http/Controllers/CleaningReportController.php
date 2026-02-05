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
        $query = CleaningReport::with('messenger')
            ->whereHas('messenger', function ($q) {
                $q->where('is_active', true);
            });

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
            'messengers' => Messenger::where('is_active', true)->orderBy('name')->get(),
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

        // Store image with compression
        $image = $request->file('evidence');
        $filename = 'cleaning_evidence/' . uniqid() . '.jpg'; // Convert to JPG

        // Native PHP Compression (GD)
        $sourceImage = null;
        $extension = strtolower($image->getClientOriginalExtension());

        switch ($extension) {
            case 'jpeg':
            case 'jpg':
                $sourceImage = imagecreatefromjpeg($image->getPathname());
                break;
            case 'png':
                $sourceImage = imagecreatefrompng($image->getPathname());
                // Preserve transparency for resizing but we convert to JPG so it will be black background
                // Or we can fill white background
                $bg = imagecreatetruecolor(imagesx($sourceImage), imagesy($sourceImage));
                $white = imagecolorallocate($bg, 255, 255, 255);
                imagefilledrectangle($bg, 0, 0, imagesx($sourceImage), imagesy($sourceImage), $white);
                imagecopy($bg, $sourceImage, 0, 0, 0, 0, imagesx($sourceImage), imagesy($sourceImage));
                $sourceImage = $bg;
                break;
            case 'webp':
                if (function_exists('imagecreatefromwebp')) {
                    $sourceImage = imagecreatefromwebp($image->getPathname());
                }
                break;
        }

        if ($sourceImage) {
            // Resize if too large (max width 1280)
            $maxWidth = 1280;
            $width = imagesx($sourceImage);
            $height = imagesy($sourceImage);

            if ($width > $maxWidth) {
                $newWidth = $maxWidth;
                $newHeight = floor($height * ($maxWidth / $width));
                $tempImage = imagecreatetruecolor($newWidth, $newHeight);
                imagecopyresampled($tempImage, $sourceImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
                imagedestroy($sourceImage);
                $sourceImage = $tempImage;
            }

            // Capture output buffer
            ob_start();
            imagejpeg($sourceImage, null, 80); // 80% quality
            $imageData = ob_get_clean();
            imagedestroy($sourceImage);

            Storage::disk('public')->put($filename, $imageData);
            $path = $filename;
        } else {
            // Fallback if GD fails or format not supported
            $path = $request->file('evidence')->store('cleaning_evidence', 'public');
        }

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

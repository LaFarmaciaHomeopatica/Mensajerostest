<?php

namespace App\Exports;

use App\Exports\Sheets\ShiftsSheet;
use App\Exports\Sheets\PreoperationalSheet;
use App\Exports\Sheets\CleaningSheet;
use App\Exports\Sheets\LunchSheet;
use App\Exports\Sheets\ShiftCompletionsSheet;
use App\Exports\Sheets\InternalProceduresSheet;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class AnalyticsMultiSheetExport implements WithMultipleSheets
{
    protected $startDate;
    protected $endDate;
    protected $messengerId;

    public function __construct($startDate, $endDate, $messengerId = null)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->messengerId = $messengerId;
    }

    public function sheets(): array
    {
        return [
            new ShiftsSheet($this->startDate, $this->endDate, $this->messengerId),
            new PreoperationalSheet($this->startDate, $this->endDate, $this->messengerId),
            new CleaningSheet($this->startDate, $this->endDate, $this->messengerId),
            new LunchSheet($this->startDate, $this->endDate, $this->messengerId),
            new ShiftCompletionsSheet($this->startDate, $this->endDate, $this->messengerId),
            new InternalProceduresSheet($this->startDate, $this->endDate, $this->messengerId),
        ];
    }
}

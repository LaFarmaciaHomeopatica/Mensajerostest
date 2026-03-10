<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class NotifyLunchEnded extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:notify-lunch-ended';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Notifica cuando un mensajero ha terminado su tiempo de almuerzo automáticamente.';

    use \App\Traits\BroadcastsMessengerStatus;

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $endedLunches = \App\Models\LunchLog::where('status', 'active')
            ->where('end_time', '<=', now())
            ->whereDate('start_time', today())
            ->get();

        if ($endedLunches->isEmpty()) {
            return;
        }

        foreach ($endedLunches as $log) {
            $log->update(['status' => 'finished']);

            $messenger = $log->messenger;
            if ($messenger) {
                $this->broadcastStatus(false, $messenger, 'ha regresado de su almuerzo (Automático) 🛵');
                $this->info("Notificación enviada para: {$messenger->name}");
            }
        }
    }
}
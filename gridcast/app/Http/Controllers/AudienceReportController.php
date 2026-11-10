<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAudienceReportRequest;
use App\Models\AudienceReport;
use App\Models\BroadcastSlot;
use Illuminate\Http\RedirectResponse;

class AudienceReportController extends Controller
{
    public function store(StoreAudienceReportRequest $request): RedirectResponse
    {
        if ($request->hasFile('csv_file')) {
            $path = $request->file('csv_file')->getRealPath();
            $file = fopen($path, 'r');
            $header = fgetcsv($file); // Skip header

            $imported = 0;
            while (($row = fgetcsv($file, 1000, ',')) !== false) {
                // Expected CSV format: broadcast_slot_id, audience_estimate, report_date, rating_points, share_percentage
                if (count($row) >= 3 && is_numeric($row[0])) {
                    $slotExists = BroadcastSlot::where('id', $row[0])->exists();
                    if ($slotExists) {
                        AudienceReport::create([
                            'broadcast_slot_id' => (int) $row[0],
                            'audience_estimate' => (int) $row[1],
                            'report_date' => $row[2],
                            'rating_points' => isset($row[3]) && $row[3] !== '' ? (float) $row[3] : null,
                            'share_percentage' => isset($row[4]) && $row[4] !== '' ? (float) $row[4] : null,
                        ]);
                        $imported++;
                    }
                }
            }
            fclose($file);

            return back()->with('success', "{$imported} rapports d'audience importés avec succès depuis le fichier CSV.");
        }

        AudienceReport::create($request->validated());

        return back()->with('success', 'Rapport d\'audience enregistré avec succès.');
    }

    public function destroy(AudienceReport $audienceReport): RedirectResponse
    {
        $audienceReport->delete();

        return back()->with('success', 'Rapport d\'audience supprimé avec succès.');
    }
}

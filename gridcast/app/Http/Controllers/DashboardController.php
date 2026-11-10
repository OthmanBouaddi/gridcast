<?php

namespace App\Http\Controllers;

use App\Models\AdvertisingSlot;
use App\Models\BroadcastSlot;
use App\Models\Category;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // 1. Program distribution by category
        $categoryDistribution = Category::withCount('programs')
            ->get()
            ->map(function ($cat) {
                return [
                    'name' => $cat->name,
                    'count' => $cat->programs_count,
                    'color' => $cat->color,
                ];
            });

        // 2. Program status breakdown & validation rate
        $totalPrograms = Program::count();
        $draftCount = Program::where('status', Program::STATUS_BROUILLON)->count();
        $submittedCount = Program::where('status', Program::STATUS_SOUMIS)->count();
        $validatedCount = Program::where('status', Program::STATUS_VALIDE)->count();
        $rejectedCount = Program::where('status', Program::STATUS_REJETE)->count();

        $evaluatedCount = $validatedCount + $rejectedCount;
        $validationRate = $evaluatedCount > 0 ? round(($validatedCount / $evaluatedCount) * 100, 1) : 0;

        $statusBreakdown = [
            ['name' => 'Brouillon', 'value' => $draftCount, 'color' => '#94a3b8'],
            ['name' => 'En validation', 'value' => $submittedCount, 'color' => '#f59e0b'],
            ['name' => 'Validé', 'value' => $validatedCount, 'color' => '#10b981'],
            ['name' => 'Rejeté', 'value' => $rejectedCount, 'color' => '#ef4444'],
        ];

        // 3. Average audience by channel time zone
        $audienceByZone = BroadcastSlot::join('audience_reports', 'broadcast_slots.id', '=', 'audience_reports.broadcast_slot_id')
            ->select(
                'broadcast_slots.channel_zone',
                DB::raw('ROUND(AVG(audience_reports.audience_estimate)) as avg_audience'),
                DB::raw('COUNT(audience_reports.id) as reports_count')
            )
            ->groupBy('broadcast_slots.channel_zone')
            ->get();

        // 4. Upcoming broadcast slots
        $upcomingSlots = BroadcastSlot::with(['program.category', 'episode'])
            ->where('start_datetime', '>=', now())
            ->orderBy('start_datetime', 'asc')
            ->take(5)
            ->get();

        // 5. Total advertising revenue
        $totalAdRevenue = AdvertisingSlot::where('status', 'diffuse')->sum('price');
        $projectedAdRevenue = AdvertisingSlot::where('status', 'reserve')->sum('price');

        // 6. User notifications
        $notifications = $user->unreadNotifications()->take(10)->get();

        return Inertia::render('Dashboard', [
            'metrics' => [
                'totalPrograms' => $totalPrograms,
                'validationRate' => $validationRate,
                'submittedCount' => $submittedCount,
                'validatedCount' => $validatedCount,
                'totalAdRevenue' => (float) $totalAdRevenue,
                'projectedAdRevenue' => (float) $projectedAdRevenue,
                'activeSlotsCount' => BroadcastSlot::where('start_datetime', '>=', now()->startOfWeek())->count(),
            ],
            'categoryDistribution' => $categoryDistribution,
            'statusBreakdown' => $statusBreakdown,
            'audienceByZone' => $audienceByZone,
            'upcomingSlots' => $upcomingSlots,
            'recentNotifications' => $notifications,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBroadcastSlotRequest;
use App\Http\Requests\UpdateBroadcastSlotRequest;
use App\Models\BroadcastSlot;
use App\Models\Program;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BroadcastSlotController extends Controller
{
    public function index(Request $request): Response
    {
        // Default to current week (Monday to Sunday)
        $weekStartParam = $request->input('start_date');
        $startDate = $weekStartParam ? Carbon::parse($weekStartParam)->startOfWeek() : Carbon::now()->startOfWeek();
        $endDate = (clone $startDate)->endOfWeek();

        $slots = BroadcastSlot::with(['program.category', 'episode', 'creator', 'advertisingSlots.advertiser', 'audienceReports'])
            ->whereBetween('start_datetime', [$startDate, $endDate])
            ->orderBy('start_datetime')
            ->get();

        // Validated programs that can be scheduled onto the grid
        $availablePrograms = Program::with(['category', 'episodes'])
            ->where('status', Program::STATUS_VALIDE)
            ->get();

        return Inertia::render('Schedule/Index', [
            'slots' => $slots,
            'availablePrograms' => $availablePrograms,
            'weekStart' => $startDate->toDateString(),
            'weekEnd' => $endDate->toDateString(),
            'channelZones' => ['Prime Time', 'Access', 'Matinée', 'Après-midi', 'Nuit'],
            'canManageGrid' => $request->user()->isProgrammation(),
        ]);
    }

    public function store(StoreBroadcastSlotRequest $request): RedirectResponse|JsonResponse
    {
        $data = $request->validated();
        $data['created_by'] = $request->user()->id;

        $slot = BroadcastSlot::create($data);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Créneau planifié avec succès.',
                'slot' => $slot->load(['program.category', 'episode']),
            ]);
        }

        return back()->with('success', 'Créneau de diffusion programmé avec succès.');
    }

    public function update(UpdateBroadcastSlotRequest $request, BroadcastSlot $broadcastSlot): RedirectResponse|JsonResponse
    {
        $broadcastSlot->update($request->validated());

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Créneau replanifié avec succès.',
                'slot' => $broadcastSlot->load(['program.category', 'episode']),
            ]);
        }

        return back()->with('success', 'Créneau mis à jour avec succès.');
    }

    public function destroy(Request $request, BroadcastSlot $broadcastSlot): RedirectResponse|JsonResponse
    {
        $this->authorize('delete', $broadcastSlot);
        $broadcastSlot->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Créneau supprimé de la grille.',
            ]);
        }

        return back()->with('success', 'Créneau retiré de la grille.');
    }
}

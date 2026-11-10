<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAdvertisingSlotRequest;
use App\Models\Advertiser;
use App\Models\AdvertisingSlot;
use App\Models\BroadcastSlot;
use App\Models\User;
use App\Notifications\AdvertisingSlotExpiring;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class AdvertisingSlotController extends Controller
{
    public function index(Request $request): Response
    {
        $startDateParam = $request->input('start_date');
        $endDateParam = $request->input('end_date');
        $advertiserId = $request->input('advertiser_id');
        $status = $request->input('status');

        $query = AdvertisingSlot::with(['advertiser', 'broadcastSlot']);

        if ($startDateParam) {
            $query->whereDate('broadcast_date', '>=', $startDateParam);
        }
        if ($endDateParam) {
            $query->whereDate('broadcast_date', '<=', $endDateParam);
        }
        if ($advertiserId) {
            $query->where('advertiser_id', $advertiserId);
        }
        if ($status) {
            $query->where('status', $status);
        }

        // Automatic revenue calculations
        $totalRevenue = (clone $query)->where('status', 'diffuse')->sum('price');
        $projectedRevenue = (clone $query)->where('status', 'reserve')->sum('price');
        $allRevenue = (clone $query)->whereIn('status', ['diffuse', 'reserve'])->sum('price');

        $slots = $query->latest('broadcast_date')->paginate(15)->withQueryString();
        $advertisers = Advertiser::withCount('advertisingSlots')->orderBy('company_name')->get();
        $availableBroadcastSlots = BroadcastSlot::where('slot_type', 'pub')
            ->orWhereNull('episode_id')
            ->orderBy('start_datetime', 'desc')
            ->take(30)
            ->get();

        return Inertia::render('Advertising/Index', [
            'slots' => $slots,
            'advertisers' => $advertisers,
            'availableBroadcastSlots' => $availableBroadcastSlots,
            'filters' => $request->only(['start_date', 'end_date', 'advertiser_id', 'status']),
            'metrics' => [
                'totalRevenue' => (float) $totalRevenue,
                'projectedRevenue' => (float) $projectedRevenue,
                'allRevenue' => (float) $allRevenue,
                'totalSlotsCount' => $slots->total(),
            ],
        ]);
    }

    public function store(StoreAdvertisingSlotRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $slot = AdvertisingSlot::create($data);

        // If broadcast date is within 2 days, notify regie
        if ($slot->broadcast_date && Carbon::parse($slot->broadcast_date)->diffInDays(now()) <= 2) {
            $regieUsers = User::whereIn('role', ['regie', 'admin'])->get();
            Notification::send($regieUsers, new AdvertisingSlotExpiring($slot));
        }

        return back()->with('success', 'Créneau publicitaire créé avec succès.');
    }

    public function update(Request $request, AdvertisingSlot $advertisingSlot): RedirectResponse
    {
        $this->authorize('update', $advertisingSlot);

        $validated = $request->validate([
            'advertiser_id' => ['sometimes', 'required', 'exists:advertisers,id'],
            'broadcast_slot_id' => ['nullable', 'exists:broadcast_slots,id'],
            'campaign_name' => ['sometimes', 'required', 'string', 'max:255'],
            'broadcast_date' => ['nullable', 'date'],
            'duration_seconds' => ['sometimes', 'required', 'integer', 'min:5', 'max:300'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'status' => ['sometimes', 'required', 'in:reserve,diffuse,annule'],
        ]);

        $advertisingSlot->update($validated);

        return back()->with('success', 'Créneau publicitaire mis à jour avec succès.');
    }

    public function destroy(AdvertisingSlot $advertisingSlot): RedirectResponse
    {
        $this->authorize('delete', $advertisingSlot);
        $advertisingSlot->delete();

        return back()->with('success', 'Créneau publicitaire supprimé avec succès.');
    }

    public function notifyUpcoming(AdvertisingSlot $advertisingSlot): RedirectResponse
    {
        $regieUsers = User::whereIn('role', ['regie', 'admin'])->get();
        Notification::send($regieUsers, new AdvertisingSlotExpiring($advertisingSlot));

        return back()->with('success', 'Notification envoyée aux équipes de la régie.');
    }
}

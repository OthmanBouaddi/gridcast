<?php

use App\Models\BroadcastSlot;
use App\Models\Category;
use App\Models\Program;
use App\Models\User;
use Carbon\Carbon;

// --- Helpers -----------------------------------------------------------------

function makeSlotUser(): User
{
    return User::factory()->create(['role' => 'admin']);
}

function makeValidProgram(): Program
{
    return Program::factory()->create([
        'category_id' => Category::factory()->create()->id,
        'status'      => 'valide',
    ]);
}

function slotPayload(string $start, string $end, string $zone = 'national', ?int $programId = null): array
{
    return [
        'program_id'     => $programId ?? makeValidProgram()->id,
        'channel_zone'   => $zone,
        'start_datetime' => $start,
        'end_datetime'   => $end,
        'slot_type'      => 'emission',
    ];
}

// --- Non-overlapping slots are accepted --------------------------------------

it('accepts a slot when there is no overlap on the same zone', function () {
    $admin = makeSlotUser();

    // First slot: 08:00 – 09:00
    BroadcastSlot::factory()->create([
        'program_id'     => makeValidProgram()->id,
        'channel_zone'   => 'national',
        'start_datetime' => Carbon::today()->setTime(8, 0),
        'end_datetime'   => Carbon::today()->setTime(9, 0),
        'slot_type'      => 'emission',
    ]);

    // Second slot: 09:00 – 10:00 (adjacent, not overlapping)
    $this->actingAs($admin)
        ->post(route('broadcast-slots.store'), slotPayload(
            Carbon::today()->setTime(9, 0)->format('Y-m-d H:i:s'),
            Carbon::today()->setTime(10, 0)->format('Y-m-d H:i:s'),
        ))
        ->assertRedirect();

    $this->assertDatabaseCount('broadcast_slots', 2);
});

// --- Overlapping slots are rejected ------------------------------------------

it('rejects a slot that fully overlaps an existing one on the same zone', function () {
    $admin = makeSlotUser();

    BroadcastSlot::factory()->create([
        'program_id'     => makeValidProgram()->id,
        'channel_zone'   => 'national',
        'start_datetime' => Carbon::today()->setTime(10, 0),
        'end_datetime'   => Carbon::today()->setTime(11, 0),
        'slot_type'      => 'emission',
    ]);

    $response = $this->actingAs($admin)
        ->post(route('broadcast-slots.store'), slotPayload(
            Carbon::today()->setTime(10, 30)->format('Y-m-d H:i:s'),
            Carbon::today()->setTime(11, 30)->format('Y-m-d H:i:s'),
        ));

    $response->assertSessionHasErrors();
    $this->assertDatabaseCount('broadcast_slots', 1);
});

it('rejects a slot that partially overlaps on start', function () {
    $admin = makeSlotUser();

    BroadcastSlot::factory()->create([
        'program_id'     => makeValidProgram()->id,
        'channel_zone'   => 'national',
        'start_datetime' => Carbon::today()->setTime(14, 0),
        'end_datetime'   => Carbon::today()->setTime(15, 0),
        'slot_type'      => 'emission',
    ]);

    $response = $this->actingAs($admin)
        ->post(route('broadcast-slots.store'), slotPayload(
            Carbon::today()->setTime(13, 30)->format('Y-m-d H:i:s'),
            Carbon::today()->setTime(14, 30)->format('Y-m-d H:i:s'),
        ));

    $response->assertSessionHasErrors();
});

// --- Same time, different zone is accepted ------------------------------------

it('accepts overlapping times on a different channel zone', function () {
    $admin = makeSlotUser();

    BroadcastSlot::factory()->create([
        'program_id'     => makeValidProgram()->id,
        'channel_zone'   => 'national',
        'start_datetime' => Carbon::today()->setTime(16, 0),
        'end_datetime'   => Carbon::today()->setTime(17, 0),
        'slot_type'      => 'emission',
    ]);

    $this->actingAs($admin)
        ->post(route('broadcast-slots.store'), slotPayload(
            Carbon::today()->setTime(16, 0)->format('Y-m-d H:i:s'),
            Carbon::today()->setTime(17, 0)->format('Y-m-d H:i:s'),
            'regional-north',
        ))
        ->assertRedirect();

    $this->assertDatabaseCount('broadcast_slots', 2);
});

// --- Update excludes self from overlap check ---------------------------------

it('allows updating a slot to the same time (no self-overlap)', function () {
    $admin = makeSlotUser();

    $slot = BroadcastSlot::factory()->create([
        'program_id'     => makeValidProgram()->id,
        'channel_zone'   => 'national',
        'start_datetime' => Carbon::today()->setTime(20, 0),
        'end_datetime'   => Carbon::today()->setTime(21, 0),
        'slot_type'      => 'emission',
    ]);

    $this->actingAs($admin)
        ->put(route('broadcast-slots.update', $slot), [
            'program_id'     => $slot->program_id,
            'channel_zone'   => 'national',
            'start_datetime' => Carbon::today()->setTime(20, 0)->format('Y-m-d H:i:s'),
            'end_datetime'   => Carbon::today()->setTime(21, 30)->format('Y-m-d H:i:s'),
            'slot_type'      => 'emission',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('broadcast_slots', [
        'id'       => $slot->id,
        'end_datetime' => Carbon::today()->setTime(21, 30)->format('Y-m-d H:i:s'),
    ]);
});

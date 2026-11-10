<?php

use App\Models\Advertiser;
use App\Models\BroadcastSlot;
use App\Models\Category;
use App\Models\Program;
use App\Models\User;
use Carbon\Carbon;

// --- Helpers -----------------------------------------------------------------

function crudAdmin(): User
{
    return User::factory()->create(['role' => 'admin']);
}

function crudProgram(?User $owner = null, string $status = 'brouillon'): Program
{
    return Program::factory()->create([
        'user_id'     => $owner?->id ?? crudAdmin()->id,
        'category_id' => Category::factory()->create()->id,
        'status'      => $status,
    ]);
}

// --- Programs CRUD -----------------------------------------------------------

it('shows the program index', function () {
    Program::factory()->count(3)->create([
        'category_id' => Category::factory()->create()->id,
        'user_id'     => crudAdmin()->id,
    ]);

    $this->actingAs(crudAdmin())
        ->get(route('programs.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Programs/Index'));
});

it('shows a single program', function () {
    $program = crudProgram();

    $this->actingAs(crudAdmin())
        ->get(route('programs.show', $program))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Programs/Show')
            ->has('program')
        );
});

it('updates a program title', function () {
    $admin = crudAdmin();
    $program = crudProgram($admin);

    $this->actingAs($admin)->put(route('programs.update', $program), [
        'title'       => 'Titre Modifie',
        'category_id' => $program->category_id,
        'language'    => $program->language,
        'duration'    => $program->duration,
        'synopsis'    => $program->synopsis,
    ])->assertRedirect();

    $this->assertDatabaseHas('programs', ['id' => $program->id, 'title' => 'Titre Modifie']);
});

it('validates required fields on program store', function () {
    $this->actingAs(crudAdmin())
        ->post(route('programs.store'), [])
        ->assertSessionHasErrors(['title', 'category_id', 'language', 'duration', 'synopsis']);
});

// --- BroadcastSlots CRUD -----------------------------------------------------

it('shows the schedule index', function () {
    $this->actingAs(crudAdmin())
        ->get(route('broadcast-slots.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Schedule/Index'));
});

it('stores a broadcast slot', function () {
    $admin   = crudAdmin();
    $program = crudProgram($admin, 'valide');

    $this->actingAs($admin)->post(route('broadcast-slots.store'), [
        'program_id'     => $program->id,
        'channel_zone'   => 'national',
        'start_datetime' => Carbon::today()->setTime(6, 0)->format('Y-m-d H:i:s'),
        'end_datetime'   => Carbon::today()->setTime(7, 0)->format('Y-m-d H:i:s'),
        'slot_type'      => 'emission',
    ])->assertRedirect();

    $this->assertDatabaseHas('broadcast_slots', [
        'program_id'   => $program->id,
        'channel_zone' => 'national',
    ]);
});

it('deletes a broadcast slot', function () {
    $admin = crudAdmin();
    $slot  = BroadcastSlot::factory()->create([
        'program_id'   => crudProgram($admin, 'valide')->id,
        'channel_zone' => 'national',
    ]);

    $this->actingAs($admin)
        ->delete(route('broadcast-slots.destroy', $slot))
        ->assertRedirect();

    $this->assertModelMissing($slot);
});

// --- Advertisers CRUD --------------------------------------------------------

it('stores a new advertiser', function () {
    $this->actingAs(crudAdmin())->post(route('advertisers.store'), [
        'company_name'  => 'Acme Corp',
        'contact_email' => 'acme@example.com',
        'contact_phone' => '+212600000000',
        'notes'         => '',
    ])->assertRedirect();

    $this->assertDatabaseHas('advertisers', ['company_name' => 'Acme Corp']);
});

it('validates email on advertiser store', function () {
    $this->actingAs(crudAdmin())->post(route('advertisers.store'), [
        'company_name'  => 'Bad Corp',
        'contact_email' => 'not-an-email',
    ])->assertSessionHasErrors(['contact_email']);
});

it('deletes an advertiser', function () {
    $admin      = crudAdmin();
    $advertiser = Advertiser::factory()->create();

    $this->actingAs($admin)
        ->delete(route('advertisers.destroy', $advertiser))
        ->assertRedirect();

    $this->assertModelMissing($advertiser);
});

// --- Dashboard ---------------------------------------------------------------

it('loads the dashboard with expected props', function () {
    $this->actingAs(crudAdmin())
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('metrics')
            ->has('categoryDistribution')
            ->has('statusBreakdown')
            ->has('audienceByZone')
            ->has('upcomingSlots')
        );
});


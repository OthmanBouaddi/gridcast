<?php

use App\Models\Category;
use App\Models\Program;
use App\Models\User;

// --- Helper -----------------------------------------------------------------

function makeUser(string $role): User
{
    return User::factory()->create(['role' => $role]);
}

function makeCategory(): Category
{
    return Category::factory()->create();
}

function makeProgram(User $owner, string $status = 'brouillon'): Program
{
    return Program::factory()->create([
        'user_id'     => $owner->id,
        'category_id' => makeCategory()->id,
        'status'      => $status,
    ]);
}

// --- Index (programs.index) --------------------------------------------------

it('allows all authenticated roles to list programs', function () {
    foreach (['admin', 'programmation', 'producteur', 'regie'] as $role) {
        $response = $this->actingAs(makeUser($role))->get(route('programs.index'));
        $response->assertOk();
    }
});

it('redirects guests from programs.index to login', function () {
    $this->get(route('programs.index'))->assertRedirect(route('login'));
});

// --- Create / Store ----------------------------------------------------------

it('allows producteur to access the create form', function () {
    $this->actingAs(makeUser('producteur'))
        ->get(route('programs.create'))
        ->assertOk();
});

it('forbids regie from accessing the create form', function () {
    $this->actingAs(makeUser('regie'))
        ->get(route('programs.create'))
        ->assertForbidden();
});

it('allows producteur to store a new program', function () {
    $category = makeCategory();
    $user = makeUser('producteur');

    $this->actingAs($user)->post(route('programs.store'), [
        'title'       => 'Mon Programme Test',
        'category_id' => $category->id,
        'language'    => 'fr',
        'duration'    => 60,
        'synopsis'    => 'Un synopsis de test suffisamment long pour passer la validation.',
    ])->assertRedirect();

    $this->assertDatabaseHas('programs', [
        'title'   => 'Mon Programme Test',
        'user_id' => $user->id,
        'status'  => 'brouillon',
    ]);
});

it('prevents regie from storing a program', function () {
    $category = makeCategory();

    $this->actingAs(makeUser('regie'))->post(route('programs.store'), [
        'title'       => 'Tentative Regie',
        'category_id' => $category->id,
        'language'    => 'fr',
        'duration'    => 30,
        'synopsis'    => 'Ce programme ne devrait pas etre cree.',
    ])->assertForbidden();
});

// --- Edit / Update -----------------------------------------------------------

it('allows producteur to edit their own brouillon program', function () {
    $user = makeUser('producteur');
    $program = makeProgram($user, 'brouillon');

    $this->actingAs($user)
        ->get(route('programs.edit', $program))
        ->assertOk();
});

it('prevents producteur from editing another user program', function () {
    $owner = makeUser('producteur');
    $other = makeUser('producteur');
    $program = makeProgram($owner, 'brouillon');

    $this->actingAs($other)
        ->get(route('programs.edit', $program))
        ->assertForbidden();
});

it('allows admin to edit any program', function () {
    $owner = makeUser('producteur');
    $program = makeProgram($owner, 'brouillon');

    $this->actingAs(makeUser('admin'))
        ->get(route('programs.edit', $program))
        ->assertOk();
});

// --- Delete ------------------------------------------------------------------

it('allows producteur to delete their own brouillon program', function () {
    $user = makeUser('producteur');
    $program = makeProgram($user, 'brouillon');

    $this->actingAs($user)
        ->delete(route('programs.destroy', $program))
        ->assertRedirect(route('programs.index'));

    $this->assertModelMissing($program);
});

it('prevents producteur from deleting a validated program', function () {
    $user = makeUser('producteur');
    $program = makeProgram($user, 'valide');

    $this->actingAs($user)
        ->delete(route('programs.destroy', $program))
        ->assertForbidden();
});

// --- Validation Queue --------------------------------------------------------

it('allows programmation to access the validation queue', function () {
    $this->actingAs(makeUser('programmation'))
        ->get(route('programs.validation-queue'))
        ->assertOk();
});

it('forbids producteur from accessing the validation queue', function () {
    $this->actingAs(makeUser('producteur'))
        ->get(route('programs.validation-queue'))
        ->assertForbidden();
});


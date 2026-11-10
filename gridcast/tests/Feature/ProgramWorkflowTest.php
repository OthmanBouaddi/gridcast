<?php

use App\Models\Category;
use App\Models\Program;
use App\Models\User;

// --- Helpers -----------------------------------------------------------------

function workflowUser(string $role): User
{
    return User::factory()->create(['role' => $role]);
}

function workflowProgram(User $owner, string $status = 'brouillon'): Program
{
    return Program::factory()->create([
        'user_id'     => $owner->id,
        'category_id' => Category::factory()->create()->id,
        'status'      => $status,
    ]);
}

// --- Submission (brouillon -> soumis) ----------------------------------------

it('allows producteur to submit their own brouillon program', function () {
    $producer = workflowUser('producteur');
    $program  = workflowProgram($producer, 'brouillon');

    $this->actingAs($producer)
        ->patch(route('programs.change-status', $program), ['status' => 'soumis'])
        ->assertRedirect();

    $this->assertDatabaseHas('programs', ['id' => $program->id, 'status' => 'soumis']);
});

it('prevents producteur from submitting another producers program', function () {
    $producer1 = workflowUser('producteur');
    $producer2 = workflowUser('producteur');
    $program   = workflowProgram($producer1, 'brouillon');

    $this->actingAs($producer2)
        ->patch(route('programs.change-status', $program), ['status' => 'soumis'])
        ->assertForbidden();
});

// --- Validation (soumis -> valide / rejete) -----------------------------------

it('allows programmation to validate a submitted program', function () {
    $programmer = workflowUser('programmation');
    $producer   = workflowUser('producteur');
    $program    = workflowProgram($producer, 'soumis');

    $this->actingAs($programmer)
        ->patch(route('programs.change-status', $program), ['status' => 'valide'])
        ->assertRedirect();

    $this->assertDatabaseHas('programs', ['id' => $program->id, 'status' => 'valide']);
});

it('allows programmation to reject a submitted program', function () {
    $programmer = workflowUser('programmation');
    $producer   = workflowUser('producteur');
    $program    = workflowProgram($producer, 'soumis');

    $this->actingAs($programmer)
        ->patch(route('programs.change-status', $program), ['status' => 'rejete'])
        ->assertRedirect();

    $this->assertDatabaseHas('programs', ['id' => $program->id, 'status' => 'rejete']);
});

it('prevents producteur from validating a program', function () {
    $producer = workflowUser('producteur');
    $program  = workflowProgram($producer, 'soumis');

    $this->actingAs($producer)
        ->patch(route('programs.change-status', $program), ['status' => 'valide'])
        ->assertForbidden();
});

// --- Invalid transitions are blocked -----------------------------------------

it('blocks jumping from brouillon directly to valide', function () {
    $programmer = workflowUser('programmation');
    $producer   = workflowUser('producteur');
    $program    = workflowProgram($producer, 'brouillon');

    $this->actingAs($programmer)
        ->patch(route('programs.change-status', $program), ['status' => 'valide'])
        ->assertSessionHasErrors('status');
});

it('blocks transitioning from valide back to soumis', function () {
    $programmer = workflowUser('programmation');
    $producer   = workflowUser('producteur');
    $program    = workflowProgram($producer, 'valide');

    $this->actingAs($programmer)
        ->patch(route('programs.change-status', $program), ['status' => 'soumis'])
        ->assertSessionHasErrors('status');
});

// --- Rejection reset (rejete -> brouillon) -----------------------------------

it('allows producteur to reset a rejected program to brouillon', function () {
    $producer = workflowUser('producteur');
    $program  = workflowProgram($producer, 'rejete');

    $this->actingAs($producer)
        ->patch(route('programs.change-status', $program), ['status' => 'brouillon'])
        ->assertRedirect();

    $this->assertDatabaseHas('programs', ['id' => $program->id, 'status' => 'brouillon']);
});


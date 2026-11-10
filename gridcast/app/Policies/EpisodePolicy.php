<?php

namespace App\Policies;

use App\Models\Episode;
use App\Models\Program;
use App\Models\User;

class EpisodePolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Episode $episode): bool
    {
        return true;
    }

    public function create(User $user, ?Program $program = null): bool
    {
        if (!$program) {
            return $user->isProducteur();
        }

        return $user->id === $program->producer_id
            && in_array($program->status, [Program::STATUS_BROUILLON, Program::STATUS_REJETE], true);
    }

    public function update(User $user, Episode $episode): bool
    {
        return $user->id === $episode->program->producer_id
            && in_array($episode->program->status, [Program::STATUS_BROUILLON, Program::STATUS_REJETE], true);
    }

    public function delete(User $user, Episode $episode): bool
    {
        return $user->id === $episode->program->producer_id
            && $episode->program->status === Program::STATUS_BROUILLON;
    }
}

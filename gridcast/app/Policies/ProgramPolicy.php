<?php

namespace App\Policies;

use App\Models\Program;
use App\Models\User;

class ProgramPolicy
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

    public function view(User $user, Program $program): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isProducteur();
    }

    public function update(User $user, Program $program): bool
    {
        // Producer can only edit their own draft or rejected programs
        return $user->id === $program->producer_id
            && in_array($program->status, [Program::STATUS_BROUILLON, Program::STATUS_REJETE], true);
    }

    public function delete(User $user, Program $program): bool
    {
        return $user->id === $program->producer_id
            && $program->status === Program::STATUS_BROUILLON;
    }

    public function submit(User $user, Program $program): bool
    {
        return $user->id === $program->producer_id
            && in_array($program->status, [Program::STATUS_BROUILLON, Program::STATUS_REJETE], true);
    }

    public function validateOrReject(User $user, Program $program): bool
    {
        return $user->role === 'programmation' && $program->status === Program::STATUS_SOUMIS;
    }
}

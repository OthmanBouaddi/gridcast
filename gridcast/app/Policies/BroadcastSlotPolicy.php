<?php

namespace App\Policies;

use App\Models\BroadcastSlot;
use App\Models\User;

class BroadcastSlotPolicy
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

    public function view(User $user, BroadcastSlot $broadcastSlot): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->role === 'programmation';
    }

    public function update(User $user, BroadcastSlot $broadcastSlot): bool
    {
        return $user->role === 'programmation';
    }

    public function delete(User $user, BroadcastSlot $broadcastSlot): bool
    {
        return $user->role === 'programmation';
    }
}

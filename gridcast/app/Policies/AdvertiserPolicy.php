<?php

namespace App\Policies;

use App\Models\Advertiser;
use App\Models\User;

class AdvertiserPolicy
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
        return $user->role === 'regie';
    }

    public function view(User $user, Advertiser $advertiser): bool
    {
        return $user->role === 'regie';
    }

    public function create(User $user): bool
    {
        return $user->role === 'regie';
    }

    public function update(User $user, Advertiser $advertiser): bool
    {
        return $user->role === 'regie';
    }

    public function delete(User $user, Advertiser $advertiser): bool
    {
        return $user->role === 'regie';
    }
}

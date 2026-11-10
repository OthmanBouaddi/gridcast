<?php

namespace App\Models;

use Database\Factories\ProgramFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends Model
{
    /** @use HasFactory<ProgramFactory> */
    use HasFactory;

    protected $fillable = [
        'title',
        'category_id',
        'language',
        'synopsis',
        'duration_minutes',
        'producer_id',
        'status',
        'rejection_reason',
    ];

    public const STATUS_BROUILLON = 'brouillon';
    public const STATUS_SOUMIS = 'soumis';
    public const STATUS_VALIDE = 'valide';
    public const STATUS_REJETE = 'rejete';

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function producer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'producer_id');
    }

    public function episodes(): HasMany
    {
        return $this->hasMany(Episode::class);
    }

    public function broadcastSlots(): HasMany
    {
        return $this->hasMany(BroadcastSlot::class);
    }

    /**
     * Check if transition from current status to target status is valid.
     */
    public function canTransitionTo(string $targetStatus, ?User $user = null): bool
    {
        $allowed = match ($this->status) {
            self::STATUS_BROUILLON => [self::STATUS_SOUMIS],
            self::STATUS_SOUMIS => [self::STATUS_VALIDE, self::STATUS_REJETE],
            self::STATUS_REJETE => [self::STATUS_BROUILLON, self::STATUS_SOUMIS],
            self::STATUS_VALIDE => [self::STATUS_BROUILLON], // if needs revision
            default => [],
        };

        if (!in_array($targetStatus, $allowed, true)) {
            return false;
        }

        if ($user) {
            // Producer can only move from brouillon/rejete to soumis or brouillon
            if ($user->role === 'producteur') {
                return in_array($targetStatus, [self::STATUS_SOUMIS, self::STATUS_BROUILLON], true);
            }

            // Programmation can validate or reject submitted programs
            if ($user->role === 'programmation') {
                return in_array($targetStatus, [self::STATUS_VALIDE, self::STATUS_REJETE, self::STATUS_BROUILLON], true);
            }

            // Admin can do any valid state transition
            if ($user->role === 'admin') {
                return true;
            }
        }

        return true;
    }
}

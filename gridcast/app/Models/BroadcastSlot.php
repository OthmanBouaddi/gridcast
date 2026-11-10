<?php

namespace App\Models;

use Carbon\Carbon;
use Database\Factories\BroadcastSlotFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BroadcastSlot extends Model
{
    /** @use HasFactory<BroadcastSlotFactory> */
    use HasFactory;

    protected $fillable = [
        'program_id',
        'episode_id',
        'slot_type',
        'title',
        'start_datetime',
        'end_datetime',
        'channel_zone',
        'created_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'start_datetime' => 'datetime',
            'end_datetime' => 'datetime',
        ];
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function episode(): BelongsTo
    {
        return $this->belongsTo(Episode::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function advertisingSlots(): HasMany
    {
        return $this->hasMany(AdvertisingSlot::class);
    }

    public function audienceReports(): HasMany
    {
        return $this->hasMany(AudienceReport::class);
    }

    /**
     * Determine if a time slot overlaps with another scheduled slot on the channel.
     * Overlap condition: (slot_start < new_end) AND (slot_end > new_start).
     */
    public static function hasOverlap(
        string|Carbon $start,
        string|Carbon $end,
        ?string $channelZone = null,
        ?int $excludeId = null
    ): bool {
        $query = static::query()
            ->where('start_datetime', '<', $end)
            ->where('end_datetime', '>', $start);

        if ($channelZone) {
            $query->where('channel_zone', $channelZone);
        }

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }
}

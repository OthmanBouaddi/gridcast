<?php

namespace App\Models;

use Database\Factories\AdvertisingSlotFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdvertisingSlot extends Model
{
    /** @use HasFactory<AdvertisingSlotFactory> */
    use HasFactory;

    protected $fillable = [
        'advertiser_id',
        'broadcast_slot_id',
        'campaign_name',
        'broadcast_date',
        'duration_seconds',
        'price',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'broadcast_date' => 'datetime',
            'price' => 'decimal:2',
        ];
    }

    public function advertiser(): BelongsTo
    {
        return $this->belongsTo(Advertiser::class);
    }

    public function broadcastSlot(): BelongsTo
    {
        return $this->belongsTo(BroadcastSlot::class);
    }
}

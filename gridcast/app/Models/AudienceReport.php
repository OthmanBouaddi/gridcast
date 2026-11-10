<?php

namespace App\Models;

use Database\Factories\AudienceReportFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AudienceReport extends Model
{
    /** @use HasFactory<AudienceReportFactory> */
    use HasFactory;

    protected $fillable = [
        'broadcast_slot_id',
        'audience_estimate',
        'report_date',
        'rating_points',
        'share_percentage',
    ];

    protected function casts(): array
    {
        return [
            'report_date' => 'date',
            'rating_points' => 'decimal:2',
            'share_percentage' => 'decimal:2',
        ];
    }

    public function broadcastSlot(): BelongsTo
    {
        return $this->belongsTo(BroadcastSlot::class);
    }
}

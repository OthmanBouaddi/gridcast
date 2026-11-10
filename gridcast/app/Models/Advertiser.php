<?php

namespace App\Models;

use Database\Factories\AdvertiserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Advertiser extends Model
{
    /** @use HasFactory<AdvertiserFactory> */
    use HasFactory;

    protected $fillable = [
        'company_name',
        'contact_email',
        'contact_phone',
        'notes',
    ];

    public function advertisingSlots(): HasMany
    {
        return $this->hasMany(AdvertisingSlot::class);
    }
}

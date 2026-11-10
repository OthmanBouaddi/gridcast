<?php

namespace Database\Factories;

use App\Models\Advertiser;
use App\Models\AdvertisingSlot;
use App\Models\BroadcastSlot;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AdvertisingSlot>
 */
class AdvertisingSlotFactory extends Factory
{
    public function definition(): array
    {
        return [
            'advertiser_id' => Advertiser::factory(),
            'broadcast_slot_id' => BroadcastSlot::factory(),
            'campaign_name' => fake()->catchPhrase(),
            'broadcast_date' => fake()->dateTimeBetween('now', '+2 weeks'),
            'duration_seconds' => fake()->randomElement([15, 20, 30, 45, 60]),
            'price' => fake()->randomElement([1500, 2500, 5000, 8500, 12000, 20000]),
            'status' => fake()->randomElement(['reserve', 'diffuse', 'annule']),
        ];
    }
}

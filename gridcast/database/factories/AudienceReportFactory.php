<?php

namespace Database\Factories;

use App\Models\AudienceReport;
use App\Models\BroadcastSlot;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AudienceReport>
 */
class AudienceReportFactory extends Factory
{
    public function definition(): array
    {
        return [
            'broadcast_slot_id' => BroadcastSlot::factory(),
            'audience_estimate' => fake()->numberBetween(50000, 1500000),
            'report_date' => fake()->date(),
            'rating_points' => fake()->randomFloat(2, 1.0, 15.0),
            'share_percentage' => fake()->randomFloat(2, 5.0, 45.0),
        ];
    }
}

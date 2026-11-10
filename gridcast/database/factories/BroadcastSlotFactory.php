<?php

namespace Database\Factories;

use App\Models\BroadcastSlot;
use App\Models\Episode;
use App\Models\Program;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BroadcastSlot>
 */
class BroadcastSlotFactory extends Factory
{
    public function definition(): array
    {
        $start = Carbon::now()->addDays(fake()->numberBetween(0, 14))->setHour(fake()->numberBetween(8, 22))->setMinute(0)->setSecond(0);
        $end = (clone $start)->addMinutes(fake()->randomElement([30, 45, 60, 90]));

        return [
            'program_id' => Program::factory(),
            'episode_id' => Episode::factory(),
            'slot_type' => 'program',
            'title' => fake()->sentence(3),
            'start_datetime' => $start,
            'end_datetime' => $end,
            'channel_zone' => fake()->randomElement(['Prime Time', 'Access', 'Matinée', 'Après-midi', 'Nuit']),
            'created_by' => User::factory()->state(['role' => 'programmation']),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}

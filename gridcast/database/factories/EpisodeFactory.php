<?php

namespace Database\Factories;

use App\Models\Episode;
use App\Models\Program;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Episode>
 */
class EpisodeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'program_id' => Program::factory(),
            'season' => fake()->numberBetween(1, 4),
            'episode_number' => fake()->numberBetween(1, 30),
            'title' => fake()->sentence(3),
            'air_status' => fake()->randomElement(['a_venir', 'diffuse', 'archive']),
        ];
    }
}

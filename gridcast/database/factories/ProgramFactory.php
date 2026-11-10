<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Program;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Program>
 */
class ProgramFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'category_id' => Category::factory(),
            'language' => fake()->randomElement(['ar', 'fr', 'darija']),
            'synopsis' => fake()->paragraph(),
            'duration_minutes' => fake()->randomElement([15, 26, 30, 45, 52, 90]),
            'producer_id' => User::factory()->state(['role' => 'producteur']),
            'status' => fake()->randomElement([Program::STATUS_BROUILLON, Program::STATUS_SOUMIS, Program::STATUS_VALIDE, Program::STATUS_REJETE]),
            'rejection_reason' => null,
        ];
    }
}

<?php

namespace App\Rules;

use App\Models\BroadcastSlot;
use Carbon\Carbon;
use Closure;
use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\ValidationRule;

class NoBroadcastOverlap implements ValidationRule, DataAwareRule
{
    protected array $data = [];

    public function __construct(
        protected ?int $excludeId = null
    ) {
    }

    public function setData(array $data): static
    {
        $this->data = $data;

        return $this;
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $startStr = $this->data['start_datetime'] ?? null;
        $endStr = $this->data['end_datetime'] ?? null;
        $channelZone = $this->data['channel_zone'] ?? null;

        if (!$startStr || !$endStr) {
            return;
        }

        try {
            $start = Carbon::parse($startStr);
            $end = Carbon::parse($endStr);
        } catch (\Exception) {
            return;
        }

        if ($end->lte($start)) {
            $fail('La date/heure de fin doit être postérieure à la date/heure de début.');

            return;
        }

        /*
         * Schedule collision detection:
         * An existing slot conflicts with the requested window when
         * existing.start_datetime < new.end_datetime AND existing.end_datetime > new.start_datetime.
         * Filtered by broadcast channel/zone if specified.
         */
        $hasOverlap = BroadcastSlot::hasOverlap($start, $end, $channelZone, $this->excludeId);

        if ($hasOverlap) {
            $fail('Ce créneau horaire chevauche un créneau de diffusion déjà existant.');
        }
    }
}

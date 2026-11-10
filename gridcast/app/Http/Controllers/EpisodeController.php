<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEpisodeRequest;
use App\Http\Requests\UpdateEpisodeRequest;
use App\Models\Episode;
use App\Models\Program;
use Illuminate\Http\RedirectResponse;

class EpisodeController extends Controller
{
    public function store(StoreEpisodeRequest $request): RedirectResponse
    {
        $program = Program::findOrFail($request->validated('program_id'));
        $this->authorize('create', [Episode::class, $program]);

        Episode::create($request->validated());

        return back()->with('success', 'Épisode ajouté avec succès.');
    }

    public function update(UpdateEpisodeRequest $request, Episode $episode): RedirectResponse
    {
        $this->authorize('update', $episode);
        $episode->update($request->validated());

        return back()->with('success', 'Épisode mis à jour avec succès.');
    }

    public function destroy(Episode $episode): RedirectResponse
    {
        $this->authorize('delete', $episode);
        $episode->delete();

        return back()->with('success', 'Épisode supprimé avec succès.');
    }
}

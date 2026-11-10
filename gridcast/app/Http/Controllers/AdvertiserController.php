<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAdvertiserRequest;
use App\Http\Requests\UpdateAdvertiserRequest;
use App\Models\Advertiser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AdvertiserController extends Controller
{
    public function store(StoreAdvertiserRequest $request): RedirectResponse
    {
        Advertiser::create($request->validated());

        return back()->with('success', 'Annonceur créé avec succès.');
    }

    public function update(UpdateAdvertiserRequest $request, Advertiser $advertiser): RedirectResponse
    {
        $advertiser->update($request->validated());

        return back()->with('success', 'Annonceur mis à jour avec succès.');
    }

    public function destroy(Request $request, Advertiser $advertiser): RedirectResponse
    {
        $this->authorize('delete', $advertiser);
        $advertiser->delete();

        return back()->with('success', 'Annonceur supprimé avec succès.');
    }
}

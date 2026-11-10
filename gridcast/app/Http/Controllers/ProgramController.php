<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangeProgramStatusRequest;
use App\Http\Requests\StoreProgramRequest;
use App\Http\Requests\UpdateProgramRequest;
use App\Models\Category;
use App\Models\Program;
use App\Models\User;
use App\Notifications\ProgramStatusChanged;
use App\Notifications\ProgramSubmitted;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class ProgramController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Program::with(['category', 'producer'])
            ->withCount('episodes');

        // Producers see only their own programs, while management/staff see all
        if ($user->role === 'producteur') {
            $query->where('producer_id', $user->id);
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('title', 'like', "%{$search}%");
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('language')) {
            $query->where('language', $request->input('language'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $programs = $query->latest()->paginate(12)->withQueryString();
        $categories = Category::all();

        return Inertia::render('Programs/Index', [
            'programs' => $programs,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'language', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Programs/Create', [
            'categories' => Category::all(),
        ]);
    }

    public function store(StoreProgramRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $submitNow = $request->boolean('submit_now');

        $program = Program::create([
            'title' => $data['title'],
            'category_id' => $data['category_id'],
            'language' => $data['language'],
            'synopsis' => $data['synopsis'] ?? null,
            'duration_minutes' => $data['duration_minutes'],
            'producer_id' => $request->user()->id,
            'status' => $submitNow ? Program::STATUS_SOUMIS : Program::STATUS_BROUILLON,
        ]);

        if ($submitNow) {
            $programManagerUsers = User::whereIn('role', ['programmation', 'admin'])->get();
            Notification::send($programManagerUsers, new ProgramSubmitted($program));
        }

        return redirect()->route('programs.show', $program->id)
            ->with('success', $submitNow ? 'Programme créé et soumis à validation avec succès.' : 'Programme enregistré en brouillon.');
    }

    public function show(Request $request, Program $program): Response
    {
        $program->load(['category', 'producer', 'episodes.broadcastSlots', 'broadcastSlots']);

        return Inertia::render('Programs/Show', [
            'program' => $program,
            'canEdit' => $request->user()->can('update', $program),
            'canValidate' => $request->user()->can('validateOrReject', $program),
        ]);
    }

    public function edit(Program $program): Response
    {
        $this->authorize('update', $program);

        return Inertia::render('Programs/Edit', [
            'program' => $program,
            'categories' => Category::all(),
        ]);
    }

    public function update(UpdateProgramRequest $request, Program $program): RedirectResponse
    {
        $program->update($request->validated());

        return redirect()->route('programs.show', $program->id)
            ->with('success', 'Programme mis à jour avec succès.');
    }

    public function destroy(Program $program): RedirectResponse
    {
        $this->authorize('delete', $program);
        $program->delete();

        return redirect()->route('programs.index')
            ->with('success', 'Programme supprimé avec succès.');
    }

    public function changeStatus(ChangeProgramStatusRequest $request, Program $program): RedirectResponse
    {
        $newStatus = $request->validated('status');
        $reason = $request->validated('rejection_reason');

        $program->status = $newStatus;
        if ($newStatus === Program::STATUS_REJETE) {
            $program->rejection_reason = $reason;
        } elseif ($newStatus === Program::STATUS_VALIDE) {
            $program->rejection_reason = null;
        }
        $program->save();

        if (in_array($newStatus, [Program::STATUS_VALIDE, Program::STATUS_REJETE], true)) {
            $program->producer->notify(new ProgramStatusChanged($program, $newStatus, $reason));
        } elseif ($newStatus === Program::STATUS_SOUMIS) {
            $programManagerUsers = User::whereIn('role', ['programmation', 'admin'])->get();
            Notification::send($programManagerUsers, new ProgramSubmitted($program));
        }

        return back()->with('success', "Statut du programme mis à jour avec succès ({$newStatus}).");
    }

    public function validationQueue(): Response
    {
        $submittedPrograms = Program::with(['category', 'producer', 'episodes'])
            ->where('status', Program::STATUS_SOUMIS)
            ->latest()
            ->paginate(15);

        return Inertia::render('Programs/ValidationQueue', [
            'programs' => $submittedPrograms,
        ]);
    }
}

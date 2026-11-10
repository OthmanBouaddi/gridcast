<?php

namespace App\Http\Controllers;

use App\Models\Advertiser;
use App\Models\AdvertisingSlot;
use App\Models\BroadcastSlot;
use App\Models\Program;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatController extends Controller
{
    public function send(Request $request): JsonResponse
    {
        $request->validate([
            'message'  => 'required|string|max:1000',
            'history'  => 'nullable|array|max:20',
        ]);

        $apiKey = config('services.gemini.key');

        if (empty($apiKey)) {
            return response()->json([
                'reply' => '⚠️ Le chatbot IA nécessite une clé API Gemini. Ajoutez `GEMINI_API_KEY` dans votre fichier `.env`.',
            ]);
        }

        $systemPrompt = $this->buildSystemPrompt($request->user());

        // Build contents array from history + current message
        $contents = [];
        foreach ($request->input('history', []) as $msg) {
            $contents[] = [
                'role'  => $msg['role'] === 'assistant' ? 'model' : 'user',
                'parts' => [['text' => $msg['content']]],
            ];
        }
        $contents[] = [
            'role'  => 'user',
            'parts' => [['text' => $request->input('message')]],
        ];

        try {
            $response = Http::timeout(30)->post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . $apiKey,
                [
                    'systemInstruction' => [
                        'parts' => [['text' => $systemPrompt]],
                    ],
                    'contents' => $contents,
                    'generationConfig' => [
                        'temperature'     => 0.4,
                        'maxOutputTokens' => 1024,
                    ],
                ]
            );

            if ($response->successful()) {
                $text = data_get($response->json(), 'candidates.0.content.parts.0.text', 'Aucune réponse reçue.');

                return response()->json(['reply' => $text]);
            }

            return response()->json(['reply' => 'Erreur API Gemini : ' . $response->status()]);
        } catch (\Exception $e) {
            return response()->json(['reply' => 'Erreur de connexion au service IA : ' . $e->getMessage()]);
        }
    }

    /**
     * Build a rich system prompt containing live database context.
     */
    private function buildSystemPrompt(?User $user): string
    {
        $today = Carbon::today();
        $weekStart = $today->copy()->startOfWeek();
        $weekEnd   = $today->copy()->endOfWeek();

        // Live data snapshots
        $totalPrograms  = Program::count();
        $validated      = Program::where('status', 'valide')->count();
        $submitted      = Program::where('status', 'soumis')->count();
        $rejected       = Program::where('status', 'rejete')->count();
        $drafts         = Program::where('status', 'brouillon')->count();

        $upcomingSlots  = BroadcastSlot::with('program')
            ->where('start_datetime', '>=', now())
            ->where('start_datetime', '<=', now()->addDays(3))
            ->orderBy('start_datetime')
            ->limit(10)
            ->get()
            ->map(fn ($s) => sprintf(
                '- %s | %s | zone: %s',
                Carbon::parse($s->start_datetime)->format('D d/m H:i'),
                $s->program?->title ?? $s->title ?? 'Créneau pub',
                $s->channel_zone
            ))
            ->join("\n");

        $advertisers = Advertiser::select('company_name', 'contact_email')->limit(10)->get()
            ->map(fn ($a) => "- {$a->company_name} ({$a->contact_email})")
            ->join("\n");

        $adRevenue = AdvertisingSlot::where('status', '!=', 'annule')->sum('price');

        $topPrograms = Program::where('status', 'valide')
            ->with('category')
            ->limit(8)
            ->get()
            ->map(fn ($p) => sprintf('- %s [%s | %s | %dmin]', $p->title, $p->category?->name ?? '—', $p->language, $p->duration_minutes))
            ->join("\n");

        $role = $user?->role ?? 'inconnu';
        $name = $user?->name ?? 'Utilisateur';

        return <<<PROMPT
Tu es **GridCast AI**, l'assistant intelligent intégré à la plateforme de gestion de grille TV GridCast pour une chaîne de télévision marocaine généraliste.

Tu t'adresses actuellement à **{$name}** dont le rôle est **{$role}**.

## Tes domaines de compétence

### 🗓️ Agent Planification
Réponds aux questions sur la grille de diffusion, les créneaux horaires, les zones (Prime Time, Access, Matinée, Nuit), et la planification hebdomadaire.

### 📺 Agent Programmes
Réponds aux questions sur le catalogue de programmes, leur statut (brouillon, soumis, validé, rejeté), les catégories, les langues (ar/fr/darija) et les durées.

### 📢 Agent Régie Publicitaire
Réponds aux questions sur les annonceurs, les créneaux publicitaires, le chiffre d'affaires et les campagnes.

### 👥 Agent Utilisateurs & Rôles
Explique les rôles (admin, programmation, producteur, régie), leurs droits et le workflow de validation des programmes.

---

## État actuel de la plateforme (données en temps réel)

**Programmes :**
- Total : {$totalPrograms} | Validés : {$validated} | Soumis (en attente) : {$submitted} | Rejetés : {$rejected} | Brouillons : {$drafts}

**Programmes validés (catalogue) :**
{$topPrograms}

**Prochains créneaux diffusion (48-72h) :**
{$upcomingSlots}

**Annonceurs actifs :**
{$advertisers}

**Chiffre d'affaires publicitaire total :** {$adRevenue} MAD

---

## Règles de comportement
- Réponds **en français** par défaut, sauf si l'utilisateur écrit en arabe ou en anglais.
- Sois concis, professionnel et utile.
- Utilise le markdown (listes, gras) pour structurer les réponses complexes.
- Si tu ne sais pas quelque chose, dis-le honnêtement.
- Ne révèle pas les détails internes de l'implémentation technique.
- Adapte ton niveau de détail selon le rôle de l'utilisateur.
PROMPT;
    }
}

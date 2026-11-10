<?php

namespace Database\Seeders;

use App\Models\Advertiser;
use App\Models\AdvertisingSlot;
use App\Models\AudienceReport;
use App\Models\BroadcastSlot;
use App\Models\Category;
use App\Models\Episode;
use App\Models\Program;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Core Users by Role
        $admin = User::firstOrCreate(
            ['email' => 'admin@gridcast.ma'],
            [
                'name' => 'Directeur Général (Admin)',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $programmation = User::firstOrCreate(
            ['email' => 'programmation@gridcast.ma'],
            [
                'name' => 'Karim Benjelloun (Prog Mgr)',
                'password' => Hash::make('password'),
                'role' => 'programmation',
                'email_verified_at' => now(),
            ]
        );

        $producer1 = User::firstOrCreate(
            ['email' => 'producteur@gridcast.ma'],
            [
                'name' => 'Youssef El Mansouri (Producteur)',
                'password' => Hash::make('password'),
                'role' => 'producteur',
                'email_verified_at' => now(),
            ]
        );

        $producer2 = User::firstOrCreate(
            ['email' => 'fatima.zahra@production.ma'],
            [
                'name' => 'Fatima-Zahra Bennani (Réalisatrice)',
                'password' => Hash::make('password'),
                'role' => 'producteur',
                'email_verified_at' => now(),
            ]
        );

        $regie = User::firstOrCreate(
            ['email' => 'regie@gridcast.ma'],
            [
                'name' => 'Samira Tahiri (Régie Pub)',
                'password' => Hash::make('password'),
                'role' => 'regie',
                'email_verified_at' => now(),
            ]
        );

        // 2. Categories with Moroccan TV themes
        $categoriesData = [
            ['name' => 'Journal & Info / الأخبار', 'slug' => 'journal', 'color' => '#ef4444', 'description' => 'Journaux télévisés, flashs info et reportages d\'actualité nationale et internationale.'],
            ['name' => 'Série / مسلسلات', 'slug' => 'serie', 'color' => '#8b5cf6', 'description' => 'Drames sociaux, séries ramadanesques et comédies dramatiques.'],
            ['name' => 'Divertissement / ترفيه', 'slug' => 'divertissement', 'color' => '#f59e0b', 'description' => 'Variétés musicales, jeux télévisés, talk-shows et galas.'],
            ['name' => 'Sport / رياضة', 'slug' => 'sport', 'color' => '#10b981', 'description' => 'Botola Pro, matchs de l\'équipe nationale et magazines omnisports.'],
            ['name' => 'Débat & Société / حوارات', 'slug' => 'debat', 'color' => '#3b82f6', 'description' => 'Émissions d\'analyse politique, économique et sociétale.'],
            ['name' => 'Documentaire / وثائقيات', 'slug' => 'documentaire', 'color' => '#06b6d4', 'description' => 'Patrimoine marocain, histoire, faune et géographie.'],
            ['name' => 'Émission religieuse / برامج دينية', 'slug' => 'religieux', 'color' => '#14b8a6', 'description' => 'Causeries religieuses, récitation coranique et spiritualité.'],
            ['name' => 'Publicité & Spots / إشهار', 'slug' => 'publicite', 'color' => '#ec4899', 'description' => 'Tunnels publicitaires, partenariats et parrainages.'],
        ];

        $categories = [];
        foreach ($categoriesData as $c) {
            $categories[$c['slug']] = Category::firstOrCreate(['slug' => $c['slug']], $c);
        }

        // 3. Programs in Arabic, Darija & French
        $programsData = [
            [
                'title' => 'المسائية (Al Massaiya - JT 21H)',
                'category_id' => $categories['journal']->id,
                'language' => 'ar',
                'synopsis' => 'النشرة الإخبارية الرئيسية تقدم قراءة وافية لأهم الأحداث الوطنية والمغاربية والدولية مع تحليلات الخبراء.',
                'duration_minutes' => 45,
                'producer_id' => $producer1->id,
                'status' => Program::STATUS_VALIDE,
            ],
            [
                'title' => 'دار الغزلان (Dar Lghizlane)',
                'category_id' => $categories['serie']->id,
                'language' => 'darija',
                'synopsis' => 'دراما اجتماعية ترصد حياة عائلات في قرية جبلية تتقاطع مصائرها بين تقاليد الأجداد وتطلعات الشباب نحو التغيير.',
                'duration_minutes' => 52,
                'producer_id' => $producer1->id,
                'status' => Program::STATUS_VALIDE,
            ],
            [
                'title' => 'Grand Angle Maroc',
                'category_id' => $categories['documentaire']->id,
                'language' => 'fr',
                'synopsis' => 'Immersion inédite au cœur des traditions vivantes et des grands chantiers modernes du Royaume.',
                'duration_minutes' => 50,
                'producer_id' => $producer2->id,
                'status' => Program::STATUS_VALIDE,
            ],
            [
                'title' => 'Botola Pro Direct - البطولة الوطنية',
                'category_id' => $categories['sport']->id,
                'language' => 'darija',
                'synopsis' => 'Reconstitution sportive et retransmission en direct du choc de la journée de Botola Pro Inwi avec plateau d\'analyse.',
                'duration_minutes' => 110,
                'producer_id' => $producer1->id,
                'status' => Program::STATUS_VALIDE,
            ],
            [
                'title' => 'L\'Œil du Débat - قضايا وآراء',
                'category_id' => $categories['debat']->id,
                'language' => 'fr',
                'synopsis' => 'Émission de décryptage des réformes socio-économiques avec ministres, universitaires et société civile.',
                'duration_minutes' => 60,
                'producer_id' => $producer2->id,
                'status' => Program::STATUS_SOUMIS,
            ],
            [
                'title' => 'سيتكوم قهوة الحومة (Qahwat Lhouma)',
                'category_id' => $categories['divertissement']->id,
                'language' => 'darija',
                'synopsis' => 'مواقف كوميدية طريفة تدور فصولها داخل مقهى شعبي يجمع شخصيات متناقضة بروح مغربية مرحة.',
                'duration_minutes' => 26,
                'producer_id' => $producer2->id,
                'status' => Program::STATUS_SOUMIS,
            ],
            [
                'title' => 'نفحات الإيمان (Nafahat Al Imane)',
                'category_id' => $categories['religieux']->id,
                'language' => 'ar',
                'synopsis' => 'دروس وقراءات روحية من المدرسة المالكية وقيم التسامح المغربية الأصيلة.',
                'duration_minutes' => 30,
                'producer_id' => $producer1->id,
                'status' => Program::STATUS_VALIDE,
            ],
            [
                'title' => 'Atlas Sauvage : Les Cimes du Toubkal',
                'category_id' => $categories['documentaire']->id,
                'language' => 'fr',
                'synopsis' => 'Documentaire animalier et botanique sur l\'écosystème du Haut Atlas.',
                'duration_minutes' => 45,
                'producer_id' => $producer2->id,
                'status' => Program::STATUS_BROUILLON,
            ],
            [
                'title' => 'شباب المستقبل (Chabab Al Moustakbal)',
                'category_id' => $categories['divertissement']->id,
                'language' => 'darija',
                'synopsis' => 'مسابقة لاكتشاف المواهب الشابة في الابتكار التكنولوجي وريادة الأعمال.',
                'duration_minutes' => 45,
                'producer_id' => $producer1->id,
                'status' => Program::STATUS_REJETE,
                'rejection_reason' => 'Le budget prévisionnel dépasse le plafond alloué et le synopsis doit être retravaillé.',
            ],
        ];

        $createdPrograms = [];
        foreach ($programsData as $pData) {
            $createdPrograms[] = Program::create($pData);
        }

        // 4. Episodes for series and magazines
        $episodes = [];
        foreach ($createdPrograms as $prog) {
            if (in_array($prog->category_id, [$categories['serie']->id, $categories['divertissement']->id, $categories['journal']->id])) {
                for ($epNum = 1; $epNum <= 4; $epNum++) {
                    $episodes[] = Episode::create([
                        'program_id' => $prog->id,
                        'season' => 1,
                        'episode_number' => $epNum,
                        'title' => "Épisode {$epNum} : " . ($epNum === 1 ? 'Lancement' : "Développement {$epNum}"),
                        'air_status' => $epNum === 1 ? 'diffuse' : 'a_venir',
                    ]);
                }
            }
        }

        // 5. Advertisers (Top Moroccan Brands)
        $advertisersData = [
            ['company_name' => 'Maroc Telecom (اتصالات المغرب)', 'contact_email' => 'partenariats@iam.ma', 'contact_phone' => '+212 537 71 90 00', 'notes' => 'Partenaire télécom historique.'],
            ['company_name' => 'inwi (إنوي)', 'contact_email' => 'media@inwi.ma', 'contact_phone' => '+212 529 00 00 00', 'notes' => 'Sponsor officiel de la Botola Pro.'],
            ['company_name' => 'Orange Maroc', 'contact_email' => 'pub@orange.ma', 'contact_phone' => '+212 520 12 12 12', 'notes' => 'Campagnes jeunesse et data 4G/5G.'],
            ['company_name' => 'Centrale Danone', 'contact_email' => 'communication@danone.ma', 'contact_phone' => '+212 522 95 80 00', 'notes' => 'Spots produits laitiers créneau Access.'],
            ['company_name' => 'Attijariwafa Bank (التجاري وفا بنك)', 'contact_email' => 'media@attijariwafa.com', 'contact_phone' => '+212 522 29 88 88', 'notes' => 'Campagnes corporate et crédits immobiliers.'],
            ['company_name' => 'Afriquia Gaz', 'contact_email' => 'marketing@akwagroup.com', 'contact_phone' => '+212 522 34 50 00', 'notes' => 'Campagnes institutionnelles.'],
        ];

        $advertisers = [];
        foreach ($advertisersData as $adv) {
            $advertisers[] = Advertiser::create($adv);
        }

        // 6. Realistic Broadcast Slots (Current week, Monday to Sunday, non-overlapping)
        $monday = Carbon::now()->startOfWeek();

        $schedulePlan = [
            // Lundi
            ['day' => 0, 'hour' => 8, 'min' => 0, 'dur' => 30, 'type' => 'program', 'prog_idx' => 6, 'zone' => 'Matinée', 'title' => 'نفحات الإيمان'],
            ['day' => 0, 'hour' => 12, 'min' => 30, 'dur' => 30, 'type' => 'pub', 'prog_idx' => null, 'zone' => 'Matinée', 'title' => 'Écran Pub - Midi'],
            ['day' => 0, 'hour' => 13, 'min' => 0, 'dur' => 50, 'type' => 'program', 'prog_idx' => 2, 'zone' => 'Après-midi', 'title' => 'Grand Angle Maroc'],
            ['day' => 0, 'hour' => 19, 'min' => 0, 'dur' => 45, 'type' => 'program', 'prog_idx' => 0, 'zone' => 'Access', 'title' => 'المسائية (JT 21H)'],
            ['day' => 0, 'hour' => 20, 'min' => 0, 'dur' => 15, 'type' => 'pub', 'prog_idx' => null, 'zone' => 'Access', 'title' => 'Tunnel Pub Prime'],
            ['day' => 0, 'hour' => 20, 'min' => 30, 'dur' => 52, 'type' => 'program', 'prog_idx' => 1, 'zone' => 'Prime Time', 'title' => 'دار الغزلان (Dar Lghizlane)'],
            ['day' => 0, 'hour' => 21, 'min' => 45, 'dur' => 60, 'type' => 'program', 'prog_idx' => 4, 'zone' => 'Prime Time', 'title' => 'L\'Œil du Débat'],

            // Mardi
            ['day' => 1, 'hour' => 9, 'min' => 0, 'dur' => 45, 'type' => 'program', 'prog_idx' => 2, 'zone' => 'Matinée', 'title' => 'Grand Angle Maroc (Rediffusion)'],
            ['day' => 1, 'hour' => 18, 'min' => 30, 'dur' => 26, 'type' => 'program', 'prog_idx' => 5, 'zone' => 'Access', 'title' => 'سيتكوم قهوة الحومة'],
            ['day' => 1, 'hour' => 19, 'min' => 15, 'dur' => 45, 'type' => 'program', 'prog_idx' => 0, 'zone' => 'Access', 'title' => 'المسائية (JT 21H)'],
            ['day' => 1, 'hour' => 20, 'min' => 30, 'dur' => 110, 'type' => 'program', 'prog_idx' => 3, 'zone' => 'Prime Time', 'title' => 'Botola Pro Direct - WAC vs AS FAR'],

            // Mercredi
            ['day' => 2, 'hour' => 14, 'min' => 0, 'dur' => 30, 'type' => 'program', 'prog_idx' => 6, 'zone' => 'Après-midi', 'title' => 'نفحات الإيمان'],
            ['day' => 2, 'hour' => 19, 'min' => 30, 'dur' => 45, 'type' => 'program', 'prog_idx' => 0, 'zone' => 'Access', 'title' => 'المسائية (JT 21H)'],
            ['day' => 2, 'hour' => 20, 'min' => 45, 'dur' => 52, 'type' => 'program', 'prog_idx' => 1, 'zone' => 'Prime Time', 'title' => 'دار الغزلان - Épisode 2'],

            // Jeudi
            ['day' => 3, 'hour' => 18, 'min' => 0, 'dur' => 50, 'type' => 'program', 'prog_idx' => 2, 'zone' => 'Access', 'title' => 'Grand Angle Maroc'],
            ['day' => 3, 'hour' => 20, 'min' => 30, 'dur' => 60, 'type' => 'program', 'prog_idx' => 4, 'zone' => 'Prime Time', 'title' => 'L\'Œil du Débat - Spécial Économie'],

            // Vendredi
            ['day' => 4, 'hour' => 12, 'min' => 0, 'dur' => 45, 'type' => 'program', 'prog_idx' => 6, 'zone' => 'Matinée', 'title' => 'خطبة الجمعة ونفحات الإيمان'],
            ['day' => 4, 'hour' => 20, 'min' => 30, 'dur' => 90, 'type' => 'program', 'prog_idx' => 5, 'zone' => 'Prime Time', 'title' => 'سهرة ترفيهية مغربية'],

            // Samedi
            ['day' => 5, 'hour' => 16, 'min' => 0, 'dur' => 110, 'type' => 'program', 'prog_idx' => 3, 'zone' => 'Après-midi', 'title' => 'Botola Pro - Raja CA vs FUS'],
            ['day' => 5, 'hour' => 20, 'min' => 45, 'dur' => 52, 'type' => 'program', 'prog_idx' => 1, 'zone' => 'Prime Time', 'title' => 'دار الغزلان - Épisode 3'],

            // Dimanche
            ['day' => 6, 'hour' => 11, 'min' => 0, 'dur' => 50, 'type' => 'program', 'prog_idx' => 2, 'zone' => 'Matinée', 'title' => 'Grand Angle Maroc'],
            ['day' => 6, 'hour' => 20, 'min' => 30, 'dur' => 60, 'type' => 'program', 'prog_idx' => 0, 'zone' => 'Prime Time', 'title' => 'المسائية - حصاد الأسبوع'],
        ];

        $createdSlots = [];
        foreach ($schedulePlan as $item) {
            $slotStart = (clone $monday)->addDays($item['day'])->setHour($item['hour'])->setMinute($item['min'])->setSecond(0);
            $slotEnd = (clone $slotStart)->addMinutes($item['dur']);

            $prog = $item['prog_idx'] !== null ? $createdPrograms[$item['prog_idx']] : null;
            $ep = $prog ? $prog->episodes()->first() : null;

            $slot = BroadcastSlot::create([
                'program_id' => $prog?->id,
                'episode_id' => $ep?->id,
                'slot_type' => $item['type'],
                'title' => $item['title'],
                'start_datetime' => $slotStart,
                'end_datetime' => $slotEnd,
                'channel_zone' => $item['zone'],
                'created_by' => $programmation->id,
                'notes' => 'Diffusion principale antenne HD.',
            ]);

            $createdSlots[] = $slot;
        }

        // 7. Advertising Slots
        $adSlot1 = AdvertisingSlot::create([
            'advertiser_id' => $advertisers[0]->id, // Maroc Telecom
            'broadcast_slot_id' => $createdSlots[4]->id, // Tunnel Pub Prime Lundi
            'campaign_name' => 'Campagne Fibre Optique 2026',
            'broadcast_date' => $createdSlots[4]->start_datetime,
            'duration_seconds' => 30,
            'price' => 18500.00,
            'status' => 'diffuse',
        ]);

        $adSlot2 = AdvertisingSlot::create([
            'advertiser_id' => $advertisers[1]->id, // inwi
            'broadcast_slot_id' => $createdSlots[9]->id, // Botola Match Mardi
            'campaign_name' => 'Inwi Botola Challenge',
            'broadcast_date' => $createdSlots[9]->start_datetime,
            'duration_seconds' => 45,
            'price' => 24000.00,
            'status' => 'diffuse',
        ]);

        $adSlot3 = AdvertisingSlot::create([
            'advertiser_id' => $advertisers[3]->id, // Centrale Danone
            'broadcast_slot_id' => $createdSlots[1]->id, // Midi Lundi
            'campaign_name' => 'Nutrition Saine Famille',
            'broadcast_date' => $createdSlots[1]->start_datetime,
            'duration_seconds' => 20,
            'price' => 8500.00,
            'status' => 'diffuse',
        ]);

        $adSlot4 = AdvertisingSlot::create([
            'advertiser_id' => $advertisers[4]->id, // Attijariwafa Bank
            'broadcast_slot_id' => $createdSlots[13]->id, // Jeudi Débat
            'campaign_name' => 'Attijari Entreprises & Startups',
            'broadcast_date' => $createdSlots[13]->start_datetime,
            'duration_seconds' => 30,
            'price' => 15000.00,
            'status' => 'reserve',
        ]);

        $adSlot5 = AdvertisingSlot::create([
            'advertiser_id' => $advertisers[2]->id, // Orange
            'broadcast_slot_id' => $createdSlots[18]->id, // Samedi Série
            'campaign_name' => 'Forfaits Orange 5G Max',
            'broadcast_date' => $createdSlots[18]->start_datetime,
            'duration_seconds' => 30,
            'price' => 16500.00,
            'status' => 'reserve',
        ]);

        // 8. Audience Reports (Ratings & Viewers)
        AudienceReport::create([
            'broadcast_slot_id' => $createdSlots[3]->id, // JT Lundi
            'audience_estimate' => 850000,
            'report_date' => $createdSlots[3]->start_datetime->toDateString(),
            'rating_points' => 9.2,
            'share_percentage' => 32.5,
        ]);

        AudienceReport::create([
            'broadcast_slot_id' => $createdSlots[5]->id, // Dar Lghizlane Lundi
            'audience_estimate' => 1420000,
            'report_date' => $createdSlots[5]->start_datetime->toDateString(),
            'rating_points' => 14.8,
            'share_percentage' => 44.2,
        ]);

        AudienceReport::create([
            'broadcast_slot_id' => $createdSlots[9]->id, // Botola Match Mardi
            'audience_estimate' => 1890000,
            'report_date' => $createdSlots[9]->start_datetime->toDateString(),
            'rating_points' => 18.5,
            'share_percentage' => 52.0,
        ]);

        AudienceReport::create([
            'broadcast_slot_id' => $createdSlots[2]->id, // Docu Grand Angle Lundi
            'audience_estimate' => 420000,
            'report_date' => $createdSlots[2]->start_datetime->toDateString(),
            'rating_points' => 4.5,
            'share_percentage' => 18.0,
        ]);

        AudienceReport::create([
            'broadcast_slot_id' => $createdSlots[0]->id, // Émission religieuse Lundi matin
            'audience_estimate' => 310000,
            'report_date' => $createdSlots[0]->start_datetime->toDateString(),
            'rating_points' => 3.2,
            'share_percentage' => 14.0,
        ]);
    }
}

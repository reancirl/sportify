<?php

namespace Database\Seeders;

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Enums\SessionPlayerStatus;
use App\Enums\SessionStatus;
use App\Enums\SkillLevel;
use App\Enums\VenueStaffRole;
use App\Enums\VenueStatus;
use App\Models\Booking;
use App\Models\Court;
use App\Models\OpenPlaySession;
use App\Models\Payment;
use App\Models\SessionPlayer;
use App\Models\User;
use App\Models\Venue;
use App\Models\VenueImage;
use App\Models\VenueOperatingHour;
use App\Models\VenueStaffMember;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * MVP demo data — sportify.ph launches in Iligan City only, so every venue
 * lives in a real Iligan barangay. Approved venues populate the public
 * marketplace; a couple of pending submissions give the super-admin queue
 * something to review.
 */
class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $superAdmin = $this->createSuperAdmin();
        $owners = $this->createOwners();
        $players = $this->createPlayers();

        $approvedVenues = $this->approvedVenueBlueprints();

        foreach ($approvedVenues as $i => $blueprint) {
            $owner = $owners[$i % $owners->count()];

            $venue = $this->createApprovedVenue($blueprint, $owner, $superAdmin);
            $this->seedOperatingHours($venue, $blueprint);
            $courts = $this->seedCourts($venue, $blueprint);
            $staff = $this->seedStaff($venue, $blueprint, $i);

            // Cover image so cards look styled rather than blank.
            VenueImage::create([
                'venue_id' => $venue->id,
                'image_path' => $blueprint['cover'],
                'sort_order' => 0,
            ]);

            $this->seedOpenPlaySession($venue, $owner, $courts, $players, $blueprint);
            $this->seedSampleBookings($courts, $players, $staff);
        }

        // Suspended venue — gives the admin "reinstate" action something to do.
        $suspendedOwner = $owners->first();
        $suspendedVenue = Venue::factory()->create([
            'owner_id' => $suspendedOwner->id,
            'name' => 'Buru-un Riverside Courts',
            'slug' => 'buru-un-riverside-courts-'.Str::lower(Str::random(6)),
            'description' => 'Riverside indoor courts currently undergoing maintenance.',
            'address_line' => 'Buru-un, near the Mandulog River bend',
            'city' => 'Iligan City',
            'province' => 'Lanao del Norte',
            'region' => 'Northern Mindanao',
            'latitude' => 8.1998,
            'longitude' => 124.2009,
            'contact_phone' => '+63 917 555 0090',
            'contact_email' => 'buruun@sportify.test',
            'timezone' => 'Asia/Manila',
            'status' => VenueStatus::Suspended,
            'approved_at' => now()->subMonths(2),
            'approved_by' => $superAdmin->id,
            'rejection_reason' => 'Floor refurbishment in progress — temporarily unlisted.',
        ]);
        Court::factory()->count(2)->create([
            'venue_id' => $suspendedVenue->id,
            'is_active' => true,
        ]);

        // Two pending venues so the super-admin queue has work waiting.
        $pendingBlueprints = $this->pendingVenueBlueprints();
        foreach ($pendingBlueprints as $i => $blueprint) {
            $owner = $owners[$i % $owners->count()];

            $venue = Venue::factory()->pending()->create([
                'owner_id' => $owner->id,
                'name' => $blueprint['name'],
                'slug' => Str::slug($blueprint['name']).'-'.Str::lower(Str::random(6)),
                'description' => $blueprint['description'],
                'address_line' => $blueprint['address_line'],
                'city' => 'Iligan City',
                'province' => 'Lanao del Norte',
                'region' => 'Northern Mindanao',
                'latitude' => $blueprint['lat'],
                'longitude' => $blueprint['lng'],
                'contact_phone' => $blueprint['phone'],
                'contact_email' => $blueprint['email'],
                'timezone' => 'Asia/Manila',
            ]);

            // A couple of inactive courts attached so the admin can see scope when reviewing.
            Court::factory()->count(2)->create([
                'venue_id' => $venue->id,
                'is_active' => true,
            ]);
        }
    }

    private function createSuperAdmin(): User
    {
        $admin = User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'admin@sportify.test',
            'password' => Hash::make('password'),
            'phone' => '+63 917 000 0000',
            'is_active' => true,
        ]);
        $admin->assignRole('super_admin');

        return $admin;
    }

    /**
     * @return Collection<int, User>
     */
    private function createOwners(): Collection
    {
        $owners = collect();

        $blueprints = [
            ['name' => 'Marisol Cabanlit', 'email' => 'marisol@sportify.test', 'phone' => '+63 917 100 0001'],
            ['name' => 'Carlo Maglinao', 'email' => 'carlo@sportify.test', 'phone' => '+63 917 100 0002'],
            ['name' => 'Anna Dimaporo', 'email' => 'anna@sportify.test', 'phone' => '+63 917 100 0003'],
        ];

        foreach ($blueprints as $bp) {
            $owner = User::factory()->create([
                'name' => $bp['name'],
                'email' => $bp['email'],
                'password' => Hash::make('password'),
                'phone' => $bp['phone'],
                'is_active' => true,
            ]);
            $owner->assignRole('venue_owner');
            $owners->push($owner);
        }

        return $owners;
    }

    /**
     * @return Collection<int, User>
     */
    private function createPlayers(): Collection
    {
        $players = collect();
        $skillLevels = [
            SkillLevel::Beginner,
            SkillLevel::Intermediate,
            SkillLevel::Intermediate,
            SkillLevel::Advanced,
            SkillLevel::Pro,
        ];

        $names = [
            'Noah Yang',
            'Bea Tampus',
            'Jomari Salcedo',
            'Trish Estrada',
            'Renz Catungal',
        ];

        foreach ($names as $i => $name) {
            $player = User::factory()->create([
                'name' => $name,
                'email' => 'player'.($i + 1).'@sportify.test',
                'password' => Hash::make('password'),
                'phone' => '+63 917 200 000'.$i,
                'skill_level' => $skillLevels[$i],
                'elo_rating' => 1000 + (($i + 1) * 50),
                'is_active' => true,
            ]);
            $player->assignRole('player');
            $players->push($player);
        }

        return $players;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function approvedVenueBlueprints(): array
    {
        return [
            [
                'name' => 'Pala-o Pickleball Club',
                'slug' => 'pala-o-pickleball-club',
                'description' => 'Iligan\'s flagship pickleball club, set in the heart of Pala-o. Tournament-grade indoor courts, full pro shop, and a quiet members lounge overlooking the courts.',
                'address_line' => 'Macapagal Avenue, Pala-o',
                'lat' => 8.2336,
                'lng' => 124.2452,
                'phone' => '+63 917 555 0011',
                'email' => 'reserve@palao.sportify.test',
                'cover' => 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?auto=format&fit=crop&w=1600&q=80',
                'court_count' => 4,
                'base_rate' => 350.00,
                'closes_sunday' => false,
            ],
            [
                'name' => 'Tibanga Racquet House',
                'slug' => 'tibanga-racquet-house',
                'description' => 'Three indoor pickleball courts plus a covered tennis court, tucked behind the Tibanga commercial strip. A favourite for after-work doubles.',
                'address_line' => 'Aguinaldo St, Tibanga',
                'lat' => 8.2298,
                'lng' => 124.2389,
                'phone' => '+63 917 555 0022',
                'email' => 'play@tibanga.sportify.test',
                'cover' => 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1600&q=80',
                'court_count' => 3,
                'base_rate' => 300.00,
                'closes_sunday' => false,
            ],
            [
                'name' => 'Maria Cristina Sports Pavilion',
                'slug' => 'maria-cristina-sports-pavilion',
                'description' => 'A sports pavilion just minutes from the Maria Cristina Falls turn-off. Two badminton courts and two pickleball courts under one airy roof.',
                'address_line' => 'Buhanginan Hills, Maria Cristina',
                'lat' => 8.1832,
                'lng' => 124.2127,
                'phone' => '+63 917 555 0033',
                'email' => 'hello@mariacristina.sportify.test',
                'cover' => 'https://images.unsplash.com/photo-1542144582-1ba00456b5e3?auto=format&fit=crop&w=1600&q=80',
                'court_count' => 4,
                'base_rate' => 280.00,
                'closes_sunday' => false,
            ],
            [
                'name' => 'Suarez Tennis & Pickleball',
                'slug' => 'suarez-tennis-pickleball',
                'description' => 'Twin clay tennis courts and three pickleball courts on the Suarez side of the highway. Coaches available on weekends.',
                'address_line' => 'Suarez Eastside, near the public market',
                'lat' => 8.2412,
                'lng' => 124.2589,
                'phone' => '+63 917 555 0044',
                'email' => 'book@suarez.sportify.test',
                'cover' => 'https://images.unsplash.com/photo-1560012057-4372e14c5085?auto=format&fit=crop&w=1600&q=80',
                'court_count' => 5,
                'base_rate' => 320.00,
                'closes_sunday' => true,
            ],
            [
                'name' => 'Hinaplanon Court Club',
                'slug' => 'hinaplanon-court-club',
                'description' => 'A members-favourite for early-morning sessions. Two tournament-spec pickleball courts and a small café for between-match recoveries.',
                'address_line' => 'Roxas Avenue Extension, Hinaplanon',
                'lat' => 8.2487,
                'lng' => 124.2515,
                'phone' => '+63 917 555 0055',
                'email' => 'concierge@hinaplanon.sportify.test',
                'cover' => 'https://images.unsplash.com/photo-1576487248805-cf45f6bcc67f?auto=format&fit=crop&w=1600&q=80',
                'court_count' => 2,
                'base_rate' => 380.00,
                'closes_sunday' => false,
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function pendingVenueBlueprints(): array
    {
        return [
            [
                'name' => 'Tominobo Indoor Sports Hall',
                'description' => 'New indoor sports hall in Tominobo with a focus on badminton and pickleball. Awaiting approval before going live.',
                'address_line' => 'Tominobo Highway, near Iligan Capitol University',
                'lat' => 8.2098,
                'lng' => 124.2310,
                'phone' => '+63 917 555 0066',
                'email' => 'apply@tominobo.sportify.test',
            ],
            [
                'name' => 'Saray Bayview Courts',
                'description' => 'Open-air courts on the Saray seafront. Currently completing inspection paperwork.',
                'address_line' => 'Saray Boulevard',
                'lat' => 8.2550,
                'lng' => 124.2780,
                'phone' => '+63 917 555 0077',
                'email' => 'apply@saray.sportify.test',
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $bp
     */
    private function createApprovedVenue(array $bp, User $owner, User $approver): Venue
    {
        return Venue::factory()->approved()->create([
            'owner_id' => $owner->id,
            'name' => $bp['name'],
            'slug' => $bp['slug'].'-'.Str::lower(Str::random(6)),
            'description' => $bp['description'],
            'address_line' => $bp['address_line'],
            'city' => 'Iligan City',
            'province' => 'Lanao del Norte',
            'region' => 'Northern Mindanao',
            'latitude' => $bp['lat'],
            'longitude' => $bp['lng'],
            'contact_phone' => $bp['phone'],
            'contact_email' => $bp['email'],
            'gcash_account_name' => $owner->name,
            'gcash_mobile_number' => str_replace([' ', '+63 '], ['', '0'], $bp['phone']),
            'cover_image_path' => $bp['cover'],
            'timezone' => 'Asia/Manila',
            'approved_by' => $approver->id,
            'approved_at' => now()->subDays(30),
        ]);
    }

    /**
     * @param  array<string, mixed>  $bp
     */
    private function seedOperatingHours(Venue $venue, array $bp): void
    {
        // 0 = Sunday, 6 = Saturday. Open 06:00–22:00 weekdays/Saturday;
        // some venues close on Sundays.
        for ($day = 0; $day <= 6; $day++) {
            $closedToday = $bp['closes_sunday'] && $day === 0;

            VenueOperatingHour::create([
                'venue_id' => $venue->id,
                'day_of_week' => $day,
                'opens_at' => $closedToday ? null : '06:00:00',
                'closes_at' => $closedToday ? null : '22:00:00',
                'is_closed' => $closedToday,
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $bp
     * @return Collection<int, Court>
     */
    private function seedCourts(Venue $venue, array $bp): Collection
    {
        $courts = collect();

        for ($c = 1; $c <= $bp['court_count']; $c++) {
            $courts->push(Court::factory()->create([
                'venue_id' => $venue->id,
                'name' => "Court {$c}",
                'hourly_rate' => $bp['base_rate'] + (($c - 1) * 50),
                'slot_minutes' => 60,
                'is_active' => true,
            ]));
        }

        return $courts;
    }

    /**
     * @param  array<string, mixed>  $bp
     */
    private function seedStaff(Venue $venue, array $bp, int $i): User
    {
        $staff = User::factory()->create([
            'name' => "Staff at {$venue->name}",
            'email' => 'staff'.($i + 1).'@sportify.test',
            'password' => Hash::make('password'),
            'phone' => '+63 917 300 000'.$i,
            'is_active' => true,
        ]);
        $staff->assignRole('venue_staff');

        VenueStaffMember::create([
            'venue_id' => $venue->id,
            'user_id' => $staff->id,
            'role' => VenueStaffRole::Staff,
        ]);

        return $staff;
    }

    /**
     * @param  Collection<int, Court>  $courts
     * @param  Collection<int, User>  $players
     * @param  array<string, mixed>  $bp
     */
    private function seedOpenPlaySession(
        Venue $venue,
        User $owner,
        Collection $courts,
        Collection $players,
        array $bp,
    ): void {
        $session = OpenPlaySession::factory()->scheduled()->create([
            'venue_id' => $venue->id,
            'created_by' => $owner->id,
            'title' => "Friday Night Open Play — {$bp['name']}",
            'description' => 'Casual round-robin. All skill levels welcome.',
            'starts_at' => now()->next(Carbon::FRIDAY)->setTime(19, 0),
            'ends_at' => now()->next(Carbon::FRIDAY)->setTime(21, 0),
            'max_players' => 12,
            'min_skill_level' => null,
            'max_skill_level' => null,
            'fee_per_player' => 200.00,
            'court_ids' => $courts->take(2)->pluck('id')->all(),
            'status' => SessionStatus::Scheduled,
        ]);

        // Two players already registered, so the listing has presence.
        foreach ($players->take(2) as $player) {
            SessionPlayer::create([
                'session_id' => $session->id,
                'user_id' => $player->id,
                'joined_at' => now()->subDays(2),
                'status' => SessionPlayerStatus::Registered,
            ]);
        }
    }

    /**
     * @param  Collection<int, Court>  $courts
     * @param  Collection<int, User>  $players
     */
    private function seedSampleBookings(
        Collection $courts,
        Collection $players,
        User $staff,
    ): void {
        if ($courts->count() < 2 || $players->count() < 4) {
            return;
        }

        $now = now();
        $court1 = $courts->first();
        $court2 = $courts->get(1);
        $court3 = $courts->get(2) ?? $courts->first();

        // Completed booking (last week) with verified payment.
        $completed = Booking::factory()->create([
            'court_id' => $court1->id,
            'user_id' => $players[0]->id,
            'starts_at' => $now->copy()->subDays(7)->setTime(10, 0),
            'ends_at' => $now->copy()->subDays(7)->setTime(11, 0),
            'total_amount' => 350.00,
            'status' => BookingStatus::Completed,
        ]);
        Payment::factory()->verified()->create([
            'payable_type' => Booking::class,
            'payable_id' => $completed->id,
            'user_id' => $players[0]->id,
            'amount' => 350.00,
            'status' => PaymentStatus::Verified,
            'verified_by' => $staff->id,
        ]);

        // Confirmed upcoming booking.
        $upcoming = Booking::factory()->confirmed()->create([
            'court_id' => $court1->id,
            'user_id' => $players[1]->id,
            'starts_at' => $now->copy()->addDays(2)->setTime(15, 0),
            'ends_at' => $now->copy()->addDays(2)->setTime(16, 0),
            'total_amount' => 350.00,
        ]);
        Payment::factory()->verified()->create([
            'payable_type' => Booking::class,
            'payable_id' => $upcoming->id,
            'user_id' => $players[1]->id,
            'amount' => 350.00,
            'status' => PaymentStatus::Verified,
            'verified_by' => $staff->id,
        ]);

        // Pending payment (gives the venue admin payments queue something to verify).
        $pending = Booking::factory()->pendingPayment()->create([
            'court_id' => $court2->id,
            'user_id' => $players[2]->id,
            'starts_at' => $now->copy()->addDays(3)->setTime(18, 0),
            'ends_at' => $now->copy()->addDays(3)->setTime(19, 0),
            'total_amount' => 400.00,
        ]);
        Payment::factory()->pending()->create([
            'payable_type' => Booking::class,
            'payable_id' => $pending->id,
            'user_id' => $players[2]->id,
            'amount' => 400.00,
            'status' => PaymentStatus::Pending,
        ]);

        // Cancelled booking for visual variety in the lists.
        Booking::factory()->cancelled()->create([
            'court_id' => $court3->id,
            'user_id' => $players[3]->id,
            'starts_at' => $now->copy()->addDays(5)->setTime(9, 0),
            'ends_at' => $now->copy()->addDays(5)->setTime(10, 0),
            'total_amount' => 400.00,
            'cancellation_reason' => 'Schedule conflict',
        ]);
    }
}

/**
 * Backend API contract — these interfaces mirror the Eloquent API Resource
 * shapes in `app/Http/Resources/`. Keep them in sync whenever a Resource
 * gains, loses, or renames a field.
 *
 * Conventions:
 * - Money / decimal:2 columns are emitted as strings (preserves precision).
 * - Datetimes are emitted as ISO 8601 strings in UTC.
 * - UUIDs are strings; integer surrogate keys (User, pivots) are numbers.
 * - Relationships are optional because Resources only emit them via
 *   `whenLoaded()`.
 */

// -----------------------------------------------------------------------------
// Enums (string-literal unions mirroring backend enums verbatim)
// -----------------------------------------------------------------------------

export type BookingStatus =
    | 'pending_payment'
    | 'confirmed'
    | 'cancelled'
    | 'completed'
    | 'no_show';

export type VenueStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type PaymentStatus = 'pending' | 'verified' | 'rejected';

export type SessionStatus =
    | 'scheduled'
    | 'full'
    | 'in_progress'
    | 'completed'
    | 'cancelled';

export type SessionPlayerStatus =
    | 'registered'
    | 'checked_in'
    | 'cancelled'
    | 'no_show';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'pro';

export type VenueStaffRole = 'owner' | 'manager' | 'staff';

export type MatchWinner = 'team_a' | 'team_b' | 'draw';

export type PaymentProvider = 'gcash' | 'maya';

// -----------------------------------------------------------------------------
// Models
// -----------------------------------------------------------------------------

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    avatar_path?: string | null;
    skill_level?: SkillLevel | null;
    elo_rating?: number | null;
    is_active: boolean;
    roles?: string[];
    created_at: string;
}

export interface VenueImage {
    id: number;
    venue_id: string;
    image_path: string;
    sort_order: number;
}

export interface VenueOperatingHour {
    id: number;
    venue_id: string;
    day_of_week: number;
    opens_at: string | null;
    closes_at: string | null;
    is_closed: boolean;
}

export interface VenueStaffMember {
    id: number;
    venue_id: string;
    user_id: number;
    role: VenueStaffRole;
    user?: User;
}

export interface VenuePaymentMethod {
    id: string;
    venue_id: string;
    provider: PaymentProvider;
    provider_label: string;
    account_name: string;
    mobile_number: string;
    qr_code_path: string | null;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface Venue {
    id: string;
    owner_id: number;
    name: string;
    slug: string;
    description: string | null;
    address_line: string;
    barangay: string | null;
    city: string;
    province: string;
    region: string;
    postal_code: string | null;
    google_maps_url: string | null;
    latitude: string | null;
    longitude: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    facebook_url: string | null;
    instagram_url: string | null;
    twitter_url: string | null;
    tiktok_url: string | null;
    website_url: string | null;
    amenities: string[] | null;
    advance_booking_weeks: number;
    cover_image_path: string | null;
    timezone: string;
    status: VenueStatus;
    approved_at: string | null;
    approved_by: number | null;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    owner?: User;
    courts?: Court[];
    images?: VenueImage[];
    operating_hours?: VenueOperatingHour[];
    staff_members?: VenueStaffMember[];
    payment_methods?: VenuePaymentMethod[];
}

export type CourtSurfaceType =
    | 'covered'
    | 'outdoor'
    | 'indoor'
    | 'hard'
    | 'clay'
    | 'grass'
    | 'synthetic';

export interface Court {
    id: string;
    venue_id: string;
    name: string;
    surface_type: CourtSurfaceType | null;
    description: string | null;
    hourly_rate: string;
    slot_minutes: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    venue?: Venue;
    bookings?: Booking[];
}

export interface CourtUnavailability {
    id: number;
    court_id: string;
    starts_at: string;
    ends_at: string;
    reason: string | null;
}

export interface Booking {
    id: string;
    court_id: string;
    user_id: number;
    starts_at: string;
    ends_at: string;
    total_amount: string;
    status: BookingStatus;
    cancellation_reason: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    court?: Court;
    user?: User;
    payment?: Payment;
}

export interface OpenPlaySession {
    id: string;
    venue_id: string;
    created_by: number;
    title: string;
    description: string | null;
    starts_at: string;
    ends_at: string;
    max_players: number;
    min_skill_level: SkillLevel | null;
    max_skill_level: SkillLevel | null;
    fee_per_player: string;
    court_ids: string[];
    status: SessionStatus;
    players_count?: number;
    created_at: string;
    updated_at: string;
    venue?: Venue;
    creator?: User;
    players?: SessionPlayer[];
}

export interface SessionPlayer {
    id: number;
    session_id: string;
    user_id: number;
    joined_at: string;
    status: SessionPlayerStatus;
    payment_id: string | null;
    session?: OpenPlaySession;
    user?: User;
    payment?: Payment;
}

export interface Payment {
    id: string;
    payable_type: string;
    payable_id: string;
    user_id: number;
    amount: string;
    proof_image_path: string | null;
    proof_url: string | null;
    reference_number: string | null;
    status: PaymentStatus;
    verified_by: number | null;
    verified_at: string | null;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
    user?: User;
    verifier?: User;
    payable?: Booking | SessionPlayer;
}

// -----------------------------------------------------------------------------
// Pagination
// -----------------------------------------------------------------------------
// Controllers currently emit raw `paginate()` output (Eloquent's
// LengthAwarePaginator::toArray() shape) — that is what Inertia receives
// when a controller passes `$x->paginate(...)` straight to `Inertia::render`.
// Once controllers route through API Resource collections, switch to the
// `{ data, meta, links }` shape — but for now we mirror the actual wire
// payload to keep the UI working.

export interface PaginatorLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    first_page_url: string | null;
    from: number | null;
    last_page: number;
    last_page_url: string | null;
    links: PaginatorLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

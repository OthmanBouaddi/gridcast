export type Role = 'admin' | 'programmation' | 'producteur' | 'regie';

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
    email_verified_at?: string;
    unread_notifications_count?: number;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    color: string;
    programs_count?: number;
    created_at?: string;
}

export type ProgramLanguage = 'ar' | 'fr' | 'darija';
export type ProgramStatus = 'brouillon' | 'soumis' | 'valide' | 'rejete';

export interface Program {
    id: number;
    title: string;
    category_id: number;
    language: ProgramLanguage;
    synopsis?: string;
    duration_minutes: number;
    producer_id: number;
    status: ProgramStatus;
    rejection_reason?: string | null;
    created_at?: string;
    category?: Category;
    producer?: User;
    episodes?: Episode[];
    episodes_count?: number;
    broadcast_slots?: BroadcastSlot[];
}

export type AirStatus = 'a_venir' | 'diffuse' | 'archive';

export interface Episode {
    id: number;
    program_id: number;
    season: number;
    episode_number: number;
    title: string;
    air_status: AirStatus;
    created_at?: string;
    program?: Program;
}

export type SlotType = 'program' | 'pub';

export interface BroadcastSlot {
    id: number;
    program_id?: number | null;
    episode_id?: number | null;
    slot_type: SlotType;
    title?: string | null;
    start_datetime: string;
    end_datetime: string;
    channel_zone: string;
    created_by: number;
    notes?: string | null;
    program?: Program;
    episode?: Episode;
    creator?: User;
    advertising_slots?: AdvertisingSlot[];
    audience_reports?: AudienceReport[];
}

export interface Advertiser {
    id: number;
    company_name: string;
    contact_email: string;
    contact_phone: string;
    notes?: string | null;
    advertising_slots_count?: number;
    created_at?: string;
}

export type AdSlotStatus = 'reserve' | 'diffuse' | 'annule';

export interface AdvertisingSlot {
    id: number;
    advertiser_id: number;
    broadcast_slot_id?: number | null;
    campaign_name?: string;
    broadcast_date?: string | null;
    duration_seconds: number;
    price: number | string;
    status: AdSlotStatus;
    advertiser?: Advertiser;
    broadcast_slot?: BroadcastSlot;
    created_at?: string;
}

export interface AudienceReport {
    id: number;
    broadcast_slot_id: number;
    audience_estimate: number;
    report_date: string;
    rating_points?: number | null;
    share_percentage?: number | null;
    created_at?: string;
    broadcast_slot?: BroadcastSlot;
}

export interface NotificationItem {
    id: string;
    type: string;
    data: {
        message: string;
        url?: string;
        title?: string;
        status?: string;
        reason?: string;
    };
    read_at: string | null;
    created_at: string;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    flash: {
        success?: string;
        error?: string;
    };
    errors?: Record<string, string>;
};

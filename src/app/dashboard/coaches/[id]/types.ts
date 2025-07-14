
export type User = {
    id: number;
    name: string;
};

export type Sport = {
    id: number;
    name: string;
};

export type CoachSport = {
    coach_id: number;
    sport_id: number;
};

export type CoachPricing = {
    id: number;
    coach_id: number;
    sport_id: number;
    pricing_type: 'session' | 'monthly';
    price: number;
    currency: string;
    description: string | null;
};

export type Coach = {
    id: number;
    user_id: number;
    bio: string | null;
    is_independent: boolean;
    organisation_id: number | null;
    court_id: number | null;
    profile_image: string | null;
    rating: number | null;
    reviews_count: number;
    user: User; // nested user object
    coach_sports: CoachSport[];
    coach_pricing: CoachPricing[];
};

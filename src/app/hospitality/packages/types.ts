
export type Package = {
    id: number;
    title: string;
    price_text: string | null;
    price_value: number | null;
    description: string | null;
    features: string[] | null;
    image_url: string | null;
    organisation_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

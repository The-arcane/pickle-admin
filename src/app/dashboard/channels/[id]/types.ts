
export type Channel = {
    id: string;
    name: string;
    type: string;
    description: string | null;
    created_by: number | null;
    created_at: string;
    visibility: 'public' | 'private';
    owner_user_id: number | null;
    owner_org_id: number | null;
};

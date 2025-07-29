
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

export type User = {
    id: number;
    name: string | null;
    profile_image_url: string | null;
}

export type ChannelMember = {
    id: number;
    channel_id: string;
    invited_user_id: number;
    status: string;
    user: User | null;
}

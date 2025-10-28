

export type User = {
    id: number;
    name: string | null;
    email: string | null;
    phone: string | null;
    is_deleted: boolean;
    created_at: string;
    profile_image_url: string | null;
};

export type Role = {
    id: number;
    name: string;
};

export type UserWithRole = {
    user: User | null;
    role: Role;
};

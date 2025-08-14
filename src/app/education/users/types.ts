
export type User = {
    id: number;
    name: string | null;
    email: string | null;
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

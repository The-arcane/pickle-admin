
export type PackageBooking = {
    id: number;
    package_id: number;
    user_id: number;
    organisation_id: number;
    status: string;
    notes: string | null;
    created_at: string;
    updated_at: string;

    // Joined data
    package: {
        title: string | null;
    } | null;
    user: {
        name: string | null;
        email: string | null;
        profile_image_url: string | null;
    } | null;
};

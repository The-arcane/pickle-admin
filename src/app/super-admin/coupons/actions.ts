
'use server';

import { createServiceRoleServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveCoupon(formData: FormData) {
    const supabase = await createServiceRoleServer();
    const id = formData.get('id') as string | null;

    try {
        const isGlobal = formData.get('is_global') === 'on';
        const payload: any = {
            code: (formData.get('code') as string)?.toUpperCase(),
            description: formData.get('description') as string,
            discount_type: formData.get('discount_type') as 'percentage' | 'fixed',
            discount_value: Number(formData.get('discount_value')),
            max_discount_amount: formData.get('max_discount_amount') ? Number(formData.get('max_discount_amount')) : null,
            min_booking_value: formData.get('min_booking_value') ? Number(formData.get('min_booking_value')) : null,
            min_slots: formData.get('min_slots') ? Number(formData.get('min_slots')) : null,
            valid_from: formData.get('valid_from') || new Date().toISOString(),
            valid_until: formData.get('valid_until') || null,
            max_usage_count: formData.get('max_usage_count') ? Number(formData.get('max_usage_count')) : null,
            is_active: formData.get('is_active') === 'on',
            organisation_id: isGlobal ? null : Number(formData.get('organisation_id')),
        };

        const applicableCourtIds = JSON.parse(formData.get('applicable_courts') as string || '[]') as number[];
        const applicableEventIds = JSON.parse(formData.get('applicable_events') as string || '[]') as number[];

        let couponId: number;

        if (id) {
            // Update
            const { data, error } = await supabase.from('coupons').update(payload).eq('id', id).select('id').single();
            if (error) throw error;
            couponId = data.id;
        } else {
            // Insert
            const { data, error } = await supabase.from('coupons').insert(payload).select('id').single();
            if (error) throw error;
            couponId = data.id;
        }

        // Sync court applicability
        await supabase.from('coupon_courts').delete().eq('coupon_id', couponId);
        if (applicableCourtIds.length > 0) {
            const courtLinks = applicableCourtIds.map(court_id => ({ coupon_id: couponId, court_id }));
            const { error: courtLinkError } = await supabase.from('coupon_courts').insert(courtLinks);
            if (courtLinkError) throw courtLinkError;
        }

        // Sync event applicability
        await supabase.from('coupon_events').delete().eq('coupon_id', couponId);
        if (applicableEventIds.length > 0) {
            const eventLinks = applicableEventIds.map(event_id => ({ coupon_id: couponId, event_id }));
            const { error: eventLinkError } = await supabase.from('coupon_events').insert(eventLinks);
            if (eventLinkError) throw eventLinkError;
        }


    } catch (e: any) {
        console.error('Error saving coupon:', e);
        if (e.code === '23505') { // Unique constraint violation
            return { error: 'A coupon with this code already exists.' };
        }
        return { error: `Database error: ${e.message}` };
    }

    revalidatePath('/super-admin/coupons');
    return { success: true, message: `Coupon saved successfully.` };
}

export async function deleteCoupon(formData: FormData) {
    const supabase = await createServiceRoleServer();
    const id = formData.get('id') as string;
    
    if (!id) {
        return { error: 'Coupon ID is missing.' };
    }

    // Deletion will cascade to join tables
    const { error } = await supabase.from('coupons').delete().eq('id', id);

    if (error) {
        return { error: `Failed to delete coupon: ${error.message}` };
    }

    revalidatePath('/super-admin/coupons');
    return { success: true, message: 'Coupon deleted.' };
}

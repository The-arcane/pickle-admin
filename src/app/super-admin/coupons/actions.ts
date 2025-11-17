
'use server';

import { createServiceRoleServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveCoupon(formData: FormData) {
    const supabase = await createServiceRoleServer();
    const id = formData.get('id') as string | null;

    try {
        const payload = {
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
        };

        if (id) {
            const { error } = await supabase.from('coupons').update(payload).eq('id', id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('coupons').insert(payload);
            if (error) throw error;
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

    const { error } = await supabase.from('coupons').delete().eq('id', id);

    if (error) {
        return { error: `Failed to delete coupon: ${error.message}` };
    }

    revalidatePath('/super-admin/coupons');
    return { success: true, message: 'Coupon deleted.' };
}


'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveBankDetails(formData: FormData) {
    const supabase = await createServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Authentication error.' };
    }

    const { data: userProfile } = await supabase.from('user').select('id').eq('user_uuid', user.id).single();
    if (!userProfile) {
        return { error: 'Could not find your user profile.' };
    }

    const { data: orgLink } = await supabase.from('user_organisations').select('organisation_id').eq('user_id', userProfile.id).single();
    if (!orgLink?.organisation_id) {
        return { error: 'You are not associated with any organization.' };
    }

    const payload = {
        organisation_id: orgLink.organisation_id,
        bank_name: formData.get('bankName') as string,
        account_holder_name: formData.get('accountHolder') as string,
        account_number: formData.get('accountNumber') as string, // This will be handled by a trigger/function in DB for encryption
        ifsc_code: formData.get('ifsc') as string,
    };

    if (!payload.bank_name || !payload.account_holder_name || !payload.account_number || !payload.ifsc_code) {
        return { error: 'All fields are required.' };
    }

    // Upsert ensures we either create a new record or update the existing one for the org.
    const { error } = await supabase
        .from('bank_details')
        .upsert(payload, { onConflict: 'organisation_id' });

    if (error) {
        console.error('Error saving bank details:', error);
        return { error: `Failed to save bank details: ${error.message}` };
    }

    revalidatePath('/arena/bank-details');
    return { success: true, message: 'Bank details saved successfully.' };
}

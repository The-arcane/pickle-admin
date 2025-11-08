
'use server';

import { createServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTicket(formData: FormData) {
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to create a ticket.' };
    }

    const { data: userProfile } = await supabase.from('user').select('id').eq('user_uuid', user.id).single();
    if (!userProfile) {
        return { error: 'Could not find your user profile.' };
    }

    const subject = formData.get('subject') as string;
    const priority = formData.get('priority') as string;
    const description = formData.get('description') as string;
    const organisationId = formData.get('organisation_id') as string;

    if (!subject || !priority || !description || !organisationId) {
        return { error: 'Subject, priority, and description are required.' };
    }

    // Insert into tickets table
    const { data: newTicket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
            user_id: userProfile.id,
            organisation_id: Number(organisationId),
            subject,
            priority,
            description,
            status: 'Open'
        })
        .select('id')
        .single();
    
    if (ticketError) {
        console.error("Error creating ticket:", ticketError);
        return { error: `Failed to create ticket: ${ticketError.message}` };
    }

    // Insert the first message into ticket_messages
    if (newTicket) {
        const { error: messageError } = await supabase
            .from('ticket_messages')
            .insert({
                ticket_id: newTicket.id,
                user_id: userProfile.id,
                message: description,
            });
        
        if (messageError) {
            console.error("Error creating initial message:", messageError);
            // Non-fatal, the ticket is still created.
        }
    }


    revalidatePath('/arena/raise-ticket');
    return { success: true, message: 'Ticket submitted successfully!' };
}


export async function addTicketReply(formData: FormData) {
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to reply.' };
    }

    const { data: userProfile } = await supabase.from('user').select('id').eq('user_uuid', user.id).single();
    if (!userProfile) {
        return { error: 'Could not find your user profile.' };
    }

    const ticketId = formData.get('ticket_id') as string;
    const message = formData.get('message') as string;

    if (!ticketId || !message) {
        return { error: 'Ticket ID and message are required.' };
    }
    
    const { error: messageError } = await supabase
        .from('ticket_messages')
        .insert({
            ticket_id: Number(ticketId),
            user_id: userProfile.id,
            message,
        });
    
    if (messageError) {
        console.error("Error adding reply:", messageError);
        return { error: `Failed to add reply: ${messageError.message}` };
    }

    // Also update the ticket's `updated_at` timestamp to bring it to the top.
    const { error: ticketUpdateError } = await supabase
        .from('tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', ticketId);

    if (ticketUpdateError) {
        console.error("Error updating ticket timestamp:", ticketUpdateError);
    }
    
    revalidatePath(`/arena/raise-ticket/${ticketId}`);
    return { success: true };
}

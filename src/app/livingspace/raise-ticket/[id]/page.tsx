
import { createServer } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { formatDistanceToNow } from 'date-fns';
import { ConversationClient } from "@/app/arena/raise-ticket/[id]/client";
import { ChevronLeft, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = 'force-dynamic';

function getInitials(name: string | undefined | null) {
  if (!name) return 'U';
  const names = name.split(' ').filter(Boolean);
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return names[0]?.substring(0, 2).toUpperCase() ?? 'U';
};

export default async function LivingspaceTicketConversationPage({ params }: { params: { id: string } }) {
    const supabase = await createServer();
    const ticketId = Number(params.id);
    
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
        return redirect('/login');
    }

    const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .select('*, user:user_id(name, profile_image_url), organisation:organisation_id(name)')
        .eq('id', ticketId)
        .single();
    
    if (ticketError || !ticket) {
        console.error("Error fetching ticket:", ticketError);
        notFound();
    }

    const { data: messages, error: messagesError } = await supabase
        .from('ticket_messages')
        .select('*, user:user_id(id, name, profile_image_url, user_type)')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

    if(messagesError) {
        console.error("Error fetching messages:", messagesError);
    }

    const processedMessages = messages?.map(msg => ({
        id: msg.id,
        message: msg.message,
        time: formatDistanceToNow(new Date(msg.created_at), { addSuffix: true }),
        from: msg.user?.id === authUser.id ? 'user' : 'support',
        userInitials: getInitials(msg.user?.name),
        isSuperAdmin: msg.user?.user_type === 3,
    })) || [];


  return (
    <div className="space-y-6">
        <div className="flex items-center gap-3">
             <Button asChild variant="outline" size="icon" className="shrink-0">
                <Link href="/livingspace/raise-ticket"><ChevronLeft className="h-4 w-4" /></Link>
            </Button>
            <div className="flex items-center gap-3">
                <Ticket className="h-8 w-8 text-orange-500" />
                <div>
                    <h1 className="text-2xl font-bold truncate max-w-sm sm:max-w-md">Re: {ticket.subject}</h1>
                    <p className="text-muted-foreground font-mono">ID: {ticket.id} | Status: {ticket.status}</p>
                </div>
            </div>
        </div>

        <ConversationClient
            ticketId={ticketId}
            initialMessages={processedMessages}
            currentUserId={authUser.id}
        />
    </div>
  );
}

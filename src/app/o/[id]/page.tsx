
import { createServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Building, Target, BookOpen } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default async function OrganizationPublicPage({ params }: { params: { id: string } }) {
    const supabase = await createServer();
    const { id } = params;

    const { data: org, error: orgError } = await supabase
        .from('organisations')
        .select('name')
        .eq('id', id)
        .eq('is_active', true) // Only show active organizations publicly
        .single();
    
    if (orgError || !org) {
        notFound();
    }

    const { data: website, error: websiteError } = await supabase
        .from('organisations_website')
        .select('*')
        .eq('org_id', id)
        .single();
    
    if(websiteError && websiteError.code !== 'PGRST116') { // Ignore "no rows found" error
         console.error("Error fetching website details:", websiteError);
    }
    
    return (
        <div className="bg-background text-foreground min-h-screen">
            <header className="relative h-64 sm:h-80 md:h-96 w-full">
                {website?.bg_image ? (
                    <Image
                        src={website.bg_image}
                        alt={`${org.name} background`}
                        fill
                        className="object-cover"
                        data-ai-hint="background"
                    />
                ) : (
                    <div className="bg-muted h-full w-full" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 md:p-12">
                   <div className="flex items-center gap-4">
                     {website?.logo && (
                        <Image
                            src={website.logo}
                            alt={`${org.name} logo`}
                            width={128}
                            height={128}
                            className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 rounded-lg bg-white p-2 shadow-lg object-contain"
                            data-ai-hint="logo"
                        />
                     )}
                     <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground shadow-black/50 [text-shadow:_0_2px_4px_var(--tw-shadow-color)]">
                        {org.name}
                     </h1>
                   </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 sm:p-8 space-y-12">
                {website?.About && (
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                             <Building className="h-7 w-7 text-primary" />
                             <h2 className="text-3xl font-bold">About Us</h2>
                        </div>
                        <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                            {website.About}
                        </p>
                    </section>
                )}
                
                <Separator />
                
                {website?.Our_vision && (
                     <section className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="order-2 md:order-1">
                            <div className="flex items-center gap-3 mb-4">
                                <Target className="h-7 w-7 text-primary" />
                                <h2 className="text-3xl font-bold">Our Vision</h2>
                            </div>
                            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                                {website.Our_vision}
                            </p>
                        </div>
                        {website.vis_image && (
                            <div className="order-1 md:order-2">
                                <Image 
                                    src={website.vis_image} 
                                    alt="Vision" 
                                    width={500}
                                    height={400}
                                    className="rounded-lg shadow-xl object-cover aspect-video"
                                    data-ai-hint="vision future"
                                />
                            </div>
                        )}
                    </section>
                )}

                {website?.Our_mission && (
                     <section className="grid md:grid-cols-2 gap-8 items-center">
                         {website.mis_image && (
                            <div>
                                <Image 
                                    src={website.mis_image} 
                                    alt="Mission" 
                                    width={500}
                                    height={400}
                                    className="rounded-lg shadow-xl object-cover aspect-video"
                                    data-ai-hint="mission action"
                                />
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <BookOpen className="h-7 w-7 text-primary" />
                                <h2 className="text-3xl font-bold">Our Mission</h2>
                            </div>
                            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                                {website.Our_mission}
                            </p>
                        </div>
                    </section>
                )}

            </main>
        </div>
    );
}

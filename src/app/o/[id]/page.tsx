
import { createServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Building, Target, BookOpen, Info, Rocket, Shield, Calendar, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

    const quickLinks = [
        { label: 'About', href: '#about', icon: Info },
        { label: 'Our Vision', href: '#vision', icon: Target },
        { label: 'Our Mission', href: '#mission', icon: Rocket },
        { label: 'Our Courts', href: '#courts', icon: Shield },
        { label: 'Our Events', href: '#events', icon: Calendar },
        { label: 'Our Coaches', href: '#coaches', icon: Users },
    ];
    
    return (
        <div className="bg-gray-900 text-white min-h-screen font-body">
            {/* Header Section */}
            <header className="relative w-full">
                <div className="relative h-60 md:h-72">
                    <Image
                        src={website?.bg_image || 'https://placehold.co/1200x300.png'}
                        alt={`${org.name} background`}
                        fill
                        className="object-cover"
                        data-ai-hint="clouds sky"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                </div>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-end -mt-16 sm:-mt-20">
                         <Image
                            src={website?.logo || 'https://placehold.co/128x128.png'}
                            alt={`${org.name} logo`}
                            width={160}
                            height={160}
                            className="h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-gray-800 bg-gray-700 object-cover"
                            data-ai-hint="logo"
                        />
                        <div className="sm:ml-6 mt-4 sm:mt-0 flex-grow">
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                                {org.name}
                            </h1>
                            <p className="text-gray-400 mt-1">Public Organization</p>
                        </div>
                        <div className="mt-4 sm:mt-0 w-full sm:w-auto">
                            <Button className="bg-teal-500 hover:bg-teal-600 text-white w-full sm:w-auto">Claim the page</Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar */}
                    <aside className="lg:col-span-1">
                        <Card className="bg-gray-800 border-gray-700">
                             <CardHeader>
                                <CardTitle className="text-lg text-white">Quick Links</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <nav className="flex flex-col gap-2">
                                    {quickLinks.map(link => (
                                        <a key={link.href} href={link.href} className="flex items-center gap-3 p-2 rounded-md bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors">
                                            <link.icon className="h-5 w-5" />
                                            <span>{link.label}</span>
                                        </a>
                                    ))}
                                </nav>
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {website?.About && (
                            <Card id="about" className="bg-gray-800 border-gray-700 scroll-mt-24">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-xl text-white">
                                        <Info className="h-6 w-6" /> About
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-400 whitespace-pre-line leading-relaxed">
                                        {website.About}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {website?.Our_vision && (
                            <Card id="vision" className="bg-gray-800 border-gray-700 scroll-mt-24">
                                <CardHeader>
                                     <CardTitle className="flex items-center gap-3 text-xl text-white">
                                        <Target className="h-6 w-6" /> Our Vision
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid md:grid-cols-3 gap-6 items-start">
                                    <div className="md:col-span-2">
                                        <p className="text-gray-400 whitespace-pre-line leading-relaxed">
                                            {website.Our_vision}
                                        </p>
                                    </div>
                                    {website.vis_image && (
                                        <div className="md:col-span-1">
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
                                </CardContent>
                            </Card>
                        )}
                        
                        {website?.Our_mission && (
                            <Card id="mission" className="bg-gray-800 border-gray-700 scroll-mt-24">
                                 <CardHeader>
                                     <CardTitle className="flex items-center gap-3 text-xl text-white">
                                        <Rocket className="h-6 w-6" /> Our Mission
                                    </CardTitle>
                                </CardHeader>
                               <CardContent>
                                    <p className="text-gray-400 whitespace-pre-line leading-relaxed">
                                        {website.Our_mission}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

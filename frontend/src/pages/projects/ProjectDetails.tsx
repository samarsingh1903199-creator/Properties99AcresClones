import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { MOCK_PROJECTS } from "@/src/constants/mockData";
import { 
    Building2, MapPin, ShieldCheck, Sparkles, Layout, Compass, 
    Zap, Wifi, Car, Waves, Dumbbell, Coffee, Download, ArrowRight
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { GlassCard } from "@/src/components/ui/GlassCard";
import { formatCurrency } from "@/src/lib/utils";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export const ProjectDetails = () => {
    const { id } = useParams();
    const project = MOCK_PROJECTS.find(p => p.id === id);

    if (!project) return <div className="pt-32 text-center">Record Unavailable</div>;

    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            {/* Hero Detail */}
            <section className="h-[70vh] relative overflow-hidden">
                <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} className="w-full h-full">
                    {project.gallery.map((img, i) => (
                        <SwiperSlide key={i}>
                            <img src={img} className="w-full h-full object-cover" />
                        </SwiperSlide>
                    ))}
                </Swiper>
                <div className="absolute inset-0 bg-linear-to-t from-luxury-black via-transparent to-transparent pointer-events-none z-10" />
                
                <div className="absolute bottom-12 left-0 right-0 z-20">
                    <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-end gap-8">
                        <div className="max-w-3xl">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 rounded-full bg-luxury-purple text-white text-[10px] font-black uppercase tracking-widest">{project.status}</span>
                                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/10">
                                    <ShieldCheck size={12} className="text-emerald-400" /> RERA Approved
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-7xl font-display font-bold tracking-tighter text-white mb-4">{project.name}</h1>
                            <p className="flex items-center gap-2 text-white/70 text-lg">
                                <MapPin size={20} className="text-luxury-purple" /> {project.location}
                            </p>
                        </div>
                        <GlassCard className="p-8 border-white/10 min-w-[340px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Investment Entry</p>
                            <div className="flex items-baseline gap-2 mb-4">
                                <p className="text-3xl font-display font-bold text-luxury-purple">{formatCurrency(project.priceStarting)}</p>
                                <span className="text-[10px] text-white/50 font-black uppercase tracking-widest">Starting</span>
                            </div>
                            <Button variant="premium" className="w-full py-6 rounded-xl bg-linear-to-r from-luxury-purple to-luxury-purple/80">Connect for Possession</Button>
                        </GlassCard>
                    </div>
                </div>
            </section>

            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="lg:col-span-2 space-y-16">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-display font-bold">The Blueprint</h2>
                        <p className="text-luxury-black/60 text-lg leading-relaxed">{project.description}</p>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-3xl font-display font-bold">Node Amenities</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                            {project.amenities.map((item, i) => (
                                <GlassCard key={i} className="p-6 text-center border-white/5 group hover:border-luxury-purple/30 transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-luxury-purple/10 flex items-center justify-center text-luxury-purple mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <Zap size={24} />
                                    </div>
                                    <p className="text-sm font-bold uppercase tracking-wider">{item}</p>
                                </GlassCard>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-3xl font-display font-bold">Floor Topology</h2>
                        <div className="space-y-4">
                            {project.floorPlans.map((plan, i) => (
                                <div key={i} className="p-6 rounded-3xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 rounded-2xl bg-white/5 p-2 overflow-hidden shrink-0">
                                            <img src={plan.image} className="w-full h-full object-cover rounded-xl" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold">{plan.type}</h4>
                                            <p className="text-sm text-white/50">{plan.area} Net Area</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-luxury-black/30 uppercase">Token Cost</p>
                                            <p className="text-2xl font-bold text-luxury-purple">{formatCurrency(plan.price)} INR</p>
                                        </div>
                                        <Button variant="outline" className="rounded-xl px-6">Blueprint View</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <GlassCard className="p-8 border-white/10 sticky top-32">
                        <h3 className="text-xl font-bold font-display mb-8 uppercase tracking-tight">Builder Core</h3>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 p-3 flex items-center justify-center">
                                <img src={project.builderLogo} className="w-full grayscale brightness-200" />
                            </div>
                            <div>
                                <p className="font-bold text-lg">{project.builderName}</p>
                                <p className="text-xs text-luxury-purple font-bold uppercase">Master Architect</p>
                            </div>
                        </div>
                        <ul className="space-y-4 text-sm text-luxury-black/50 mb-10">
                            <li className="flex items-center justify-between"><span>Deals Closed</span><span className="text-luxury-black font-bold">240+</span></li>
                            <li className="flex items-center justify-between"><span>Experience</span><span className="text-luxury-black font-bold">18y</span></li>
                            <li className="flex items-center justify-between"><span>Active Projects</span><span className="text-luxury-black font-bold">12</span></li>
                        </ul>
                        <Button variant="outline" className="w-full rounded-xl py-6 flex items-center justify-center gap-2">
                            <Download size={18} /> Download Brochure
                        </Button>
                    </GlassCard>
                </div>
            </section>
        </div>
    );
};

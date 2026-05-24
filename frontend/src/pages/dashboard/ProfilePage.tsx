import { motion } from "framer-motion";
import { useAuthStore } from "@/src/store/useAuthStore";
import { 
    Mail, MapPin, Calendar, ShieldCheck,
    Settings, LogOut, Edit3, Lock, Bell,
    Heart, History, CreditCard, Layout, Zap,
    Building2, ArrowUpRight, Shield, Sparkles, CalendarClock
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";
import { Link } from "react-router-dom";
import { ROUTES } from "@/src/constants/routes";
import { useWishlistStore } from "@/src/store/useWishlistStore";
import { MOCK_PROPERTIES } from "@/src/constants/mockData";

export const ProfilePage = () => {
    const { user, logout } = useAuthStore();
    const { savedPropertyIds } = useWishlistStore();
    
    // Fallback user if not logged in (for demo)
    const activeUser: any = user || {
        id: "demo-user",
        name: "Commander Shepard",
        email: "shepard@normandy.alliance",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shepard",
        role: "user" as const,
        location: "Metropol District, Sector 1",
        joinedDate: "2024-05-15",
        phone: "+1 (555) 777-1234",
        bio: "Special Spectre authorized to acquire high-value assets across the galaxy."
    };

    const savedCount = savedPropertyIds.length;
    const recentSaves = MOCK_PROPERTIES.filter(p => savedPropertyIds.includes(p.id)).slice(0, 3);

    return (
        <div className="bg-luxury-gray min-h-screen pt-32 pb-20 overflow-x-hidden">
            <div className="max-w-[1500px] mx-auto px-6 md:px-12 space-y-12">
                
                {/* Profile Header Block */}
                <section className="relative group">
                    <div className="absolute inset-0 bg-luxury-purple/5 blur-3xl opacity-30 -z-10" />
                    
                    <div className="p-8 md:p-14 bg-white rounded-[3rem] border border-luxury-purple/5 shadow-premium overflow-hidden relative">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-luxury-purple/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                        
                        <div className="flex flex-col lg:flex-row gap-12 items-start lg:items-center relative z-10">
                            {/* Avatar Section */}
                            <div className="relative shrink-0">
                                <div className="w-32 h-32 md:w-52 md:h-52 rounded-[3.5rem] overflow-hidden border-4 border-luxury-purple/10 shadow-2xl group/avatar transition-all bg-luxury-gray">
                                    <img 
                                        src={activeUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeUser.name}`} 
                                        alt={activeUser.name} 
                                        className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-1000" 
                                    />
                                    <button className="absolute inset-0 bg-luxury-black/60 backdrop-blur-sm opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center text-white transition-all">
                                        <Edit3 size={32} />
                                    </button>
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-luxury-purple text-white p-3 rounded-2xl border-4 border-white shadow-xl">
                                    <ShieldCheck size={24} className="fill-white/20" />
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="flex-1 space-y-8">
                                <div>
                                    <div className="flex flex-wrap items-center gap-4 mb-4">
                                        <h1 className="text-4xl md:text-6xl font-display font-black text-luxury-black tracking-tighter uppercase leading-[0.9]">
                                            {activeUser.name}
                                        </h1>
                                        <span className="px-5 py-2 bg-luxury-purple text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-luxury-purple/20">
                                            Elite Estate Tier
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-6 text-luxury-black/40 text-sm font-medium">
                                        <div className="flex items-center gap-2.5">
                                            <Mail size={16} className="text-luxury-purple" /> {activeUser.email}
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <MapPin size={16} className="text-luxury-purple" /> {activeUser.location}
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <Calendar size={16} className="text-luxury-purple" /> Member since May 2024
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <Button variant="premium" className="rounded-2xl h-14 px-10 text-[11px] font-black tracking-widest flex items-center gap-2 shadow-xl shadow-luxury-purple/20 transition-all active:scale-95">
                                        <Edit3 size={16} /> MODIFY PROFILE
                                    </Button>
                                    <Button variant="glass" className="rounded-2xl h-14 px-8 text-[11px] font-black tracking-widest flex items-center gap-2 bg-luxury-gray text-luxury-black hover:bg-white transition-all shadow-sm border border-luxury-purple/5">
                                        <Settings size={16} /> PREFERENCES
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={logout}
                                        className="rounded-2xl h-14 px-8 text-[11px] font-black tracking-widest flex items-center gap-2 border-red-500/10 text-red-500 hover:bg-red-50 transition-all bg-white"
                                    >
                                        <LogOut size={16} /> TERMINATE SESSION
                                    </Button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 lg:flex lg:flex-col gap-8 shrink-0 lg:border-l lg:border-luxury-purple/10 lg:pl-16">
                                <div className="text-center lg:text-left">
                                    <p className="text-4xl font-display font-black text-luxury-purple tracking-tighter uppercase">{savedCount}</p>
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-luxury-black/30 mt-1">Saved Assets</p>
                                </div>
                                <div className="text-center lg:text-left">
                                    <p className="text-4xl font-display font-black text-luxury-black tracking-tighter uppercase">12</p>
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-luxury-black/30 mt-1">Direct Viewings</p>
                                </div>
                                <div className="text-center lg:text-left">
                                    <p className="text-4xl font-display font-black text-emerald-500 tracking-tighter uppercase">98%</p>
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-luxury-black/30 mt-1">Trust Score</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* Left Column: Activity & Saves */}
                    <div className="lg:col-span-2 space-y-16">
                        {/* Saved Quick View */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-display font-black text-luxury-black tracking-tighter uppercase">Private Portfolio</h2>
                                <Link to={ROUTES.DASHBOARD.SAVED}>
                                    <Button variant="ghost" className="text-luxury-purple hover:bg-luxury-purple/5 transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest px-6 h-12 rounded-xl">
                                        EXPLORE ALL <ArrowUpRight size={16} />
                                    </Button>
                                </Link>
                            </div>

                            {recentSaves.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {recentSaves.map((prop) => (
                                        <div key={prop.id} className="p-0 overflow-hidden group transition-all flex flex-col h-full bg-white rounded-[2.5rem] border border-luxury-purple/5 shadow-premium">
                                            <div className="h-52 relative overflow-hidden">
                                                <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000 grayscale group-hover:grayscale-0" />
                                                <div className="absolute top-5 left-5">
                                                    <span className="px-4 py-1.5 bg-luxury-purple text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                                                        {prop.type}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-8 flex-1 flex flex-col">
                                                <h3 className="text-xl font-display font-black text-luxury-black mb-1 truncate tracking-tight">{prop.title}</h3>
                                                <div className="flex items-center gap-2 text-luxury-black/30 text-xs mb-6 font-medium">
                                                    <MapPin size={14} className="text-luxury-purple/40" /> {prop.location}
                                                </div>
                                                <div className="mt-auto flex items-center justify-between">
                                                    <span className="text-2xl font-display font-black text-luxury-purple tracking-tighter">${prop.price.toLocaleString()}</span>
                                                    <Link to={ROUTES.PROPERTY_DETAILS(prop.id)}>
                                                        <Button variant="outline" size="sm" className="rounded-xl border-luxury-purple/5 hover:border-luxury-purple/20 hover:bg-luxury-purple/5 transition-all px-6 h-11 text-[10px] font-black uppercase tracking-widest bg-white text-luxury-black">
                                                            VIEW FILE
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-24 flex flex-col items-center justify-center text-center opacity-60 bg-white rounded-[3rem] border border-luxury-purple/5 shadow-inner">
                                    <Heart size={60} className="text-luxury-purple/10 mb-6" strokeWidth={1} />
                                    <p className="text-luxury-black/30 font-black uppercase tracking-[0.3em] text-xs">Portfolio is currently vacant</p>
                                </div>
                            )}
                        </div>

                        {/* Recent Activity */}
                        <div className="space-y-8">
                            <h2 className="text-3xl font-display font-black text-luxury-black tracking-tighter uppercase">Signature Activity</h2>
                            <div className="space-y-4">
                                {[
                                    { type: 'Sync', icon: Zap, label: 'Viewing Secured: Grand Horizon Estate', time: '2 hours ago', status: 'Success' },
                                    { type: 'Visit', icon: Calendar, label: 'Elite Advisory Session Scheduled', time: '1 day ago', status: 'Pending' },
                                    { type: 'Auth', icon: Shield, label: 'Account Verified via Premium Protocol', time: '3 days ago', status: 'Verified' },
                                    { type: 'Save', icon: Heart, label: 'Added Sky Villa to Private Portfolio', time: '4 days ago', status: 'Curated' }
                                ].map((log, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-white border border-luxury-purple/5 hover:border-luxury-purple/20 hover:bg-luxury-gray/50 transition-all group shadow-sm">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-luxury-gray flex items-center justify-center text-luxury-purple group-hover:bg-luxury-purple group-hover:text-white transition-all shadow-sm">
                                                <log.icon size={22} className="fill-current opacity-20 group-hover:opacity-100" />
                                            </div>
                                            <div>
                                                <p className="text-base font-black text-luxury-black/80 tracking-tight">{log.label}</p>
                                                <p className="text-[10px] text-luxury-black/30 font-black uppercase tracking-[0.2em] mt-1">{log.time}</p>
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm",
                                            log.status === 'Success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                                            log.status === 'Verified' ? 'bg-luxury-purple text-white border-transparent' :
                                            'bg-luxury-gray border-luxury-purple/5 text-luxury-black/40'
                                        )}>
                                            {log.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Settings & Quick Actions */}
                    <aside className="space-y-10">
                        {/* Security Center */}
                        <div className="p-10 space-y-8 bg-white rounded-[3rem] border border-luxury-purple/5 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-luxury-purple/5 rounded-bl-[4rem]" />
                            <div className="flex items-center gap-4 relative z-10">
                                <Shield className="text-luxury-purple" size={28} />
                                <h3 className="text-2xl font-display font-black text-luxury-black tracking-tighter uppercase">Privacy Base</h3>
                            </div>
                            <div className="space-y-4 relative z-10">
                                <button className="w-full p-5 rounded-2xl bg-luxury-gray border border-luxury-purple/5 flex items-center justify-between hover:bg-white hover:shadow-premium transition-all group">
                                    <div className="flex items-center gap-4">
                                        <Lock size={18} className="text-luxury-purple/40" />
                                        <span className="text-xs font-black text-luxury-black/60 uppercase tracking-widest">Enhanced Auth</span>
                                    </div>
                                    <div className="w-10 h-5 rounded-full bg-luxury-purple shadow-inner relative">
                                        <div className="absolute right-1 top-1 w-3 h-3 rounded-full bg-white shadow-lg" />
                                    </div>
                                </button>
                                <button className="w-full p-5 rounded-2xl bg-luxury-gray border border-luxury-purple/5 flex items-center justify-between hover:bg-white hover:shadow-premium transition-all group">
                                    <div className="flex items-center gap-4">
                                        <Bell size={18} className="text-luxury-purple/40" />
                                        <span className="text-xs font-black text-luxury-black/60 uppercase tracking-widest">Elite Alerts</span>
                                    </div>
                                    <div className="w-10 h-5 rounded-full bg-luxury-purple/10 shadow-inner relative">
                                        <div className="absolute left-1 top-1 w-3 h-3 rounded-full bg-white shadow-lg" />
                                    </div>
                                </button>
                            </div>
                            
                            <div className="pt-6 border-t border-luxury-black/5">
                                <Button variant="ghost" className="w-full text-xs font-black uppercase tracking-[0.2em] text-luxury-purple/40 hover:text-luxury-purple transition-colors h-auto p-0">
                                    Advanced Vault Settings
                                </Button>
                            </div>
                        </div>

                        {/* Quick Navigation */}
                        <div className="space-y-4">
                             {[
                                 { icon: Layout,        label: 'Executive Dashboard',  path: ROUTES.DASHBOARD.ROOT },
                                 { icon: Building2,     label: 'Unveil New Asset',     path: ROUTES.DASHBOARD.POST },
                                 { icon: CalendarClock, label: 'Visit Enquiries',       path: ROUTES.DASHBOARD.ENQUIRIES },
                                 { icon: History,       label: 'Transaction History',  path: '#' },
                                 { icon: CreditCard,    label: 'Portfolio Financing',  path: '#' },
                             ].map((item, i) => (
                                 <Link key={i} to={item.path}>
                                    <button className="w-full p-6 rounded-[2rem] bg-white border border-luxury-purple/5 flex items-center justify-between hover:border-luxury-purple/30 hover:bg-luxury-purple hover:text-white transition-all group shadow-sm hover:shadow-xl hover:scale-[1.02]">
                                        <div className="flex items-center gap-5">
                                            <item.icon size={22} className="text-luxury-purple group-hover:text-white transition-colors" />
                                            <span className="text-sm font-black uppercase tracking-[0.2em]">{item.label}</span>
                                        </div>
                                        <ArrowUpRight size={18} className="text-luxury-black/10 group-hover:text-white transition-colors group-hover:translate-x-1 group-hover:-translate-y-1" />
                                    </button>
                                 </Link>
                             ))}
                        </div>

                        {/* Upgrade Promo */}
                        <div className="p-10 rounded-[3.5rem] bg-luxury-purple text-white relative overflow-hidden group cursor-pointer shadow-2xl transition-all hover:scale-[1.03]">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                            <div className="absolute bottom-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-all group-hover:translate-x-2">
                                <ShieldCheck size={120} />
                            </div>
                            <h3 className="text-3xl font-display font-black mb-3 relative z-10 tracking-tighter uppercase leading-none">Elite Concierge</h3>
                            <p className="text-sm text-white/60 mb-8 relative z-10 leading-relaxed font-medium">Unlock priority consultation and exclusive off-market asset valuations.</p>
                            <Button variant="premium" className="w-full h-16 rounded-[1.5rem] relative z-10 font-black tracking-widest text-[11px] bg-white text-luxury-purple hover:bg-white/90 shadow-xl border-transparent">ACTIVATE MEMBERSHIP</Button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { MOCK_SPECIALISTS } from "@/src/constants/mockData";
import { 
    ShieldCheck, Star, MapPin, Phone, Mail, MessageSquare, 
    Calendar, Languages, Award, ChevronRight, Zap, Target, Users, BookOpen, Share2, Layers, Briefcase, Sparkles
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { GlassCard } from "@/src/components/ui/GlassCard";
import { useCounter } from "@/src/hooks/useCounter";

export const SpecialistDetails = () => {
  const { id } = useParams();
  const specialist = MOCK_SPECIALISTS.find(s => s.id === id);

  if (!specialist) {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <GlassCard className="text-center p-12 max-w-md">
                <h2 className="text-2xl font-bold mb-4">Specialist Not Found</h2>
                <Button variant="premium" asChild>
                    <Link to="/specialists">Back to Network</Link>
                </Button>
            </GlassCard>
        </div>
    );
  }

  const StatItem = ({ label, value, icon: Icon, unit = "" }: any) => {
    const animatedVal = useCounter(parseInt(value.toString()), 2000);
    return (
        <GlassCard className="p-6 border-white/5 bg-white/[0.02] flex flex-col items-center text-center group hover:border-luxury-purple/30 transition-all duration-500">
            <div className="w-12 h-12 rounded-2xl bg-luxury-purple/10 flex items-center justify-center text-luxury-purple mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                <Icon size={24} />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-luxury-black/30 mb-1">{label}</p>
            <p className="text-3xl font-display font-bold text-luxury-black">{animatedVal}{unit}</p>
        </GlassCard>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      {/* Hero Profile Header */}
      <section className="relative h-[450px] overflow-hidden">
        <img src={specialist.coverImage} className="w-full h-full object-cover scale-105 blur-sm brightness-50" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-luxury-black/60 to-luxury-black" />
        
        <div className="absolute inset-0 flex items-end">
            <div className="max-w-7xl mx-auto w-full px-6 md:px-12 pb-12">
                <div className="flex flex-col md:flex-row items-end gap-8">
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative">
                        <div className="w-40 h-40 md:w-56 md:h-56 rounded-3xl bg-[var(--bg-main)] p-1.5 border border-white/10 shadow-2xl overflow-hidden">
                            <img src={specialist.avatar} alt={specialist.name} className="w-full h-full rounded-2xl object-cover" />
                        </div>
                        {specialist.verified && (
                            <div className="absolute -top-2 -right-2 w-10 h-10 bg-luxury-purple rounded-full flex items-center justify-center border-4 border-luxury-black shadow-premium">
                                <ShieldCheck size={20} className="text-white" />
                            </div>
                        )}
                    </motion.div>

                    <div className="flex-1 space-y-4">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="flex items-center flex-wrap gap-3 mb-2">
                                <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight">{specialist.name}</h1>
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-yellow-400">
                                    <Star size={14} className="fill-yellow-400" />
                                    {specialist.rating}
                                </div>
                            </div>
                            <p className="text-luxury-purple font-bold uppercase tracking-[0.2em] text-sm">{specialist.role}</p>
                        </motion.div>
                        <div className="flex flex-wrap gap-6 text-white/50 text-sm">
                            <span className="flex items-center gap-2"><MapPin size={16} /> {specialist.location}</span>
                            <span className="flex items-center gap-2"><Briefcase size={16} /> {specialist.company}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="premium" className="h-14 px-10 rounded-2xl text-lg font-bold">Contact Advisor</Button>
                    </div>
                </div>
            </div>
        </div>
      </section>

      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="space-y-8">
            <GlassCard className="p-8 border-white/10">
                <h3 className="text-xl font-bold font-display mb-8 uppercase tracking-tight text-luxury-black">Direct Node Link</h3>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Phone className="text-luxury-purple" />
                        <p className="font-bold text-luxury-black">{specialist.phone}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Mail className="text-luxury-purple" />
                        <p className="font-bold text-luxury-black">{specialist.email}</p>
                    </div>
                </div>
                <Button variant="premium" className="w-full mt-10 py-6 rounded-xl">Book Site Audit</Button>
            </GlassCard>
        </div>

        <div className="lg:col-span-2 space-y-12">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <StatItem label="Active Listings" value={specialist.totalProperties} icon={Layers} />
                <StatItem label="Deals Sync'd" value={specialist.dealsClosed} icon={Zap} />
                <StatItem label="Experience" value={specialist.experience} unit="y" icon={Target} />
            </div>
            <div className="space-y-6">
                <h3 className="text-3xl font-display font-bold">Professional Dossier</h3>
                <p className="text-white/60 text-lg leading-relaxed">{specialist.bio}</p>
            </div>
        </div>
      </section>
    </div>
  );
};

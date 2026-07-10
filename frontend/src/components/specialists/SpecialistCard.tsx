import { motion } from "framer-motion";
import { Star, ShieldCheck, MapPin, Briefcase, MessageSquare, ChevronRight, Zap } from "lucide-react";
import { Specialist } from "@/src/types";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { cn } from "@/src/lib/utils";
import { Link } from "react-router-dom";

interface SpecialistCardProps {
  specialist: Specialist;
  index: number;
}

export const SpecialistCard = ({ specialist, index }: SpecialistCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      viewport={{ once: true }}
    >
      <GlassCard className="group p-0 rounded-3xl overflow-hidden glass-card-hover border-[var(--glass-border)] h-full transition-all duration-500 hover:shadow-2xl hover:shadow-luxury-purple/10 flex flex-col">
        {/* Cover & Avatar Section */}
        <div className="relative h-32 bg-linear-to-br from-luxury-gray to-luxury-black overflow-hidden">
            <img 
                src={specialist.coverImage} 
                alt="Cover" 
                className="w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-linear-to-b from-transparent to-luxury-black/80" />
            
            <div className="absolute -bottom-10 left-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-[var(--bg-main)] p-1 border border-white/10 shadow-xl overflow-hidden">
                        <img 
                            src={specialist.avatar} 
                            alt={specialist.name} 
                            className="w-full h-full rounded-xl object-cover bg-luxury-gray"
                        />
                    </div>
                    {specialist.verified && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-luxury-purple rounded-full flex items-center justify-center border-2 border-[var(--bg-main)] shadow-lg">
                            <ShieldCheck size={12} className="text-white" />
                        </div>
                    )}
                </div>
            </div>

            <div className="absolute top-4 right-6">
                <div className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md border",
                    specialist.availability === 'online' ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", specialist.availability === 'online' ? "bg-green-400" : "bg-orange-400")} />
                    {specialist.availability}
                </div>
            </div>
        </div>

        {/* Content Section */}
        <div className="pt-14 px-6 pb-6 flex-1 flex flex-col">
          <div className="mb-4">
            <h3 className="text-xl font-bold font-display group-hover:text-luxury-purple transition-colors">{specialist.name}</h3>
            <p className="text-xs text-[var(--text-main)]/40 font-bold uppercase tracking-widest mt-1">{specialist.company}</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {specialist.specialization.map(spec => (
                <span key={spec} className="px-2 py-1 rounded-lg bg-black/5 border border-[var(--glass-border)] text-[9px] font-bold uppercase tracking-tighter text-[var(--text-main)]/60">
                    {spec}
                </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-black/5 border border-white/5">
                <p className="text-[9px] text-[var(--text-main)]/30 font-bold uppercase mb-1">Experience</p>
                <p className="text-base font-bold font-display">{specialist.experience}+ Years</p>
            </div>
            <div className="p-3 rounded-2xl bg-black/5 border border-white/5">
                <p className="text-[9px] text-[var(--text-main)]/30 font-bold uppercase mb-1">Active Market</p>
                <p className="text-base font-bold font-display">{specialist.totalProperties} Listings</p>
            </div>
            <div className="col-span-2 p-3 rounded-2xl bg-black/5 border border-white/5 flex items-center justify-between">
                <div>
                    <p className="text-[9px] text-[var(--text-main)]/30 font-bold uppercase mb-1">Deals Closed</p>
                    <p className="text-base font-bold font-display">{specialist.dealsClosed}+ Enquiries</p>
                </div>
                <Zap size={16} className="text-luxury-purple animate-pulse" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-[var(--glass-border)] mt-auto">
            <div className="flex items-center gap-1.5">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold">{specialist.rating}</span>
                <span className="text-[10px] text-[var(--text-main)]/30">({specialist.reviewCount})</span>
            </div>
            <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl text-luxury-purple hover:bg-luxury-purple/10">
                    <MessageSquare size={18} />
                </Button>
                <Button variant="glass" size="sm" className="rounded-xl group-hover:border-luxury-purple/50" asChild>
                    <Link to={`/specialists/${specialist.id}`}>
                        Profile <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </Button>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

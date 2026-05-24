import { motion } from "framer-motion";
import { Building2, Calendar, MapPin, ArrowUpRight, ShieldCheck, Zap, Layers, Sparkles } from "lucide-react";
import { Project } from "@/src/types";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { cn, formatCurrency } from "@/src/lib/utils";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export const ProjectCard = ({ project, index }: ProjectCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      viewport={{ once: true }}
    >
      <GlassCard className="group p-0 rounded-3xl overflow-hidden glass-card-hover border-[var(--glass-border)] h-full transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-luxury-purple/10 flex flex-col">
        {/* Image / Gallery */}
        <div className="relative h-64 overflow-hidden shrink-0">
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true, dynamicBullets: true }}
            autoplay={{ delay: 3000 + (index * 500) }}
            className="w-full h-full"
          >
            {project.gallery.slice(0, 3).map((img, i) => (
              <SwiperSlide key={i}>
                <img 
                  src={img} 
                  alt={project.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <div className="px-3 py-1 rounded-full bg-luxury-purple/90 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                <Sparkles size={10} className="animate-pulse" />
                <span>{project.status.split('-').join(' ')}</span>
            </div>
            {project.luxury && (
                <div className="px-3 py-1 rounded-full bg-luxury-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest border border-luxury-purple/20 flex items-center gap-1.5">
                    <Layers size={10} className="text-luxury-purple" />
                    <span>Luxury Tier</span>
                </div>
            )}
          </div>

          <div className="absolute top-4 right-4 z-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-2">
                <img src={project.builderLogo} alt={project.builderName} className="w-full grayscale brightness-200" />
              </div>
          </div>
          
          <div className="absolute bottom-4 right-4 z-10">
             <div className="px-3 py-1 rounded-full bg-green-500/20 backdrop-blur-md text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-500/30 flex items-center gap-1.5">
                <ShieldCheck size={10} />
                <span>RERA Approved</span>
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="mb-4">
            <h3 className="text-xl font-bold font-display group-hover:text-luxury-purple transition-colors line-clamp-1">{project.name}</h3>
            <p className="text-xs text-[var(--text-main)]/40 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                <Building2 size={12} className="text-luxury-purple" />
                By {project.builderName}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[var(--text-main)]/40 text-[11px] font-semibold mb-6">
            <MapPin className="w-3.5 h-3.5 text-luxury-purple" />
            {project.location}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-black/5 border border-white/5">
                <p className="text-[10px] text-[var(--text-main)]/30 font-bold uppercase mb-1">Possession</p>
                <p className="text-sm font-bold font-display flex items-center gap-2">
                    <Calendar size={14} className="text-luxury-purple" />
                    {project.possessionDate}
                </p>
            </div>
            <div className="p-3 rounded-2xl bg-black/5 border border-white/5">
                <p className="text-[10px] text-[var(--text-main)]/30 font-bold uppercase mb-1">Starting From</p>
                <p className="text-sm font-bold font-display text-luxury-purple">{formatCurrency(project.priceStarting)}</p>
            </div>
          </div>

          <div className="mt-auto space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]/30">
                  <span>Development Progress</span>
                  <span className="text-luxury-purple">{project.completionPercentage}%</span>
              </div>
              <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${project.completionPercentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full premium-gradient shadow-lg" 
                  />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="premium" className="flex-1 rounded-xl shadow-luxury-purple/20" asChild>
                    <Link to={`/projects/${project.id}`}>
                        View Master Plan <ArrowUpRight size={14} className="ml-2" />
                    </Link>
                </Button>
              </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

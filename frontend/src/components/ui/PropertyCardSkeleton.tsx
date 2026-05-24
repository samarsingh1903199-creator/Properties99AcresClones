import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";

export const PropertyCardSkeleton = () => {
  return (
    <GlassCard className="p-0 rounded-3xl overflow-hidden border-[var(--glass-border)] h-full flex flex-col pointer-events-none">
      <div className="relative h-72 bg-white/5 animate-pulse" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="h-6 w-3/4 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-6 w-1/4 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="h-4 w-1/2 bg-white/5 rounded-lg animate-pulse" />
        <div className="grid grid-cols-3 gap-2 py-4 border-y border-white/5">
          <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
        </div>
        <div className="flex justify-between items-center pt-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
            <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="h-10 w-24 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    </GlassCard>
  );
};

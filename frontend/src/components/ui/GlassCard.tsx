import { cn } from "@/src/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const GlassCard = ({ children, className, glow = false, ...props }: GlassCardProps) => {
  return (
    <motion.div
      className={cn(
        "glass-card p-6 relative overflow-hidden",
        glow && "before:absolute before:inset-0 before:bg-linear-to-br before:from-luxury-purple/10 before:to-transparent before:opacity-0 hover:before:opacity-100 transition-opacity",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

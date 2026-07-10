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
        "card-marketing p-6 relative overflow-hidden",
        glow && "hover:shadow-elevated-4 transition-shadow duration-300",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

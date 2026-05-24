import { motion } from "framer-motion";
import { Landmark } from "lucide-react";

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-luxury-black flex items-center justify-center">
      <div className="relative">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-16 h-16 premium-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-luxury-purple/20"
        >
          <Landmark className="text-white w-8 h-8" />
        </motion.div>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-luxury-purple text-xs font-bold uppercase tracking-[0.3em] whitespace-nowrap"
        >
          Initializing...
        </motion.div>
      </div>
    </div>
  );
};

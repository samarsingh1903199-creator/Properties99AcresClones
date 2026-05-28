import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWishlistStore } from "@/src/store/useWishlistStore";
import { useAuthStore } from "@/src/store/useAuthStore";
import { ROUTES } from "@/src/constants/routes";
import { cn } from "@/src/lib/utils";

interface WishlistButtonProps {
  propertyId: string;
  className?: string;
  variant?: "default" | "floating" | "outline";
}

export const WishlistButton = ({ propertyId, className, variant = "default" }: WishlistButtonProps) => {
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { token, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  if (!propertyId) return null;

  const isLiked = isInWishlist(propertyId);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !token) {
      navigate(ROUTES.AUTH.LOGIN);
      return;
    }

    setIsAnimating(true);
    toggleWishlist(propertyId, token);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const variantClass = {
    default: cn(
      "relative flex items-center justify-center transition-all duration-300",
      isLiked ? "text-luxury-purple" : "text-luxury-black/20 hover:text-luxury-black/40"
    ),
    floating: cn(
      "w-12 h-12 rounded-[1.25rem] backdrop-blur-xl flex items-center justify-center border transition-all duration-300",
      isLiked
        ? "bg-luxury-purple border-luxury-purple shadow-[0_10px_20px_rgba(91,33,182,0.3)] text-white"
        : "bg-white/80 text-luxury-black/40 border-luxury-purple/5 hover:bg-luxury-purple hover:text-white"
    ),
    outline: cn(
      "flex items-center gap-3 px-8 py-4 rounded-2xl border transition-all duration-500 group",
      isLiked
        ? "bg-luxury-purple border-luxury-purple text-white shadow-xl shadow-luxury-purple/20"
        : "bg-white border-luxury-purple/5 text-luxury-black/40 hover:border-luxury-purple/20 hover:bg-luxury-purple/5"
    ),
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(variantClass[variant], "cursor-pointer active:scale-90", className)}
    >
      <motion.div
        animate={isAnimating ? { scale: [1, 1.5, 0.8, 1.2, 1] } : {}}
        transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
      >
        <Heart
          size={variant === "floating" ? 20 : 22}
          className={cn(isLiked && "fill-current")}
        />
      </motion.div>

      {variant === "outline" && (
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
          {isLiked ? "In Portfolio" : "Add to Portfolio"}
        </span>
      )}

      <AnimatePresence>
        {isLiked && isAnimating && (
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 2.5 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-luxury-purple/40 rounded-full blur-md -z-10"
          />
        )}
      </AnimatePresence>
    </button>
  );
};

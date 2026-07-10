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
      isLiked ? "text-error" : "text-mute hover:text-ink"
    ),
    floating: cn(
      "w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300",
      isLiked
        ? "bg-accent border-accent text-on-primary shadow-elevated-3"
        : "bg-canvas/95 text-body border-hairline hover:bg-accent-soft hover:text-accent-deep backdrop-blur-sm"
    ),
    outline: cn(
      "flex items-center gap-2.5 px-6 py-3 rounded-full border transition-all duration-300",
      isLiked
        ? "bg-ink border-ink text-on-primary"
        : "bg-canvas border-hairline text-body hover:border-hairline-strong hover:bg-canvas-soft"
    ),
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(variantClass[variant], "cursor-pointer active:scale-95", className)}
    >
      <motion.div
        animate={isAnimating ? { scale: [1, 1.35, 0.9, 1.1, 1] } : {}}
        transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
      >
        <Heart
          size={variant === "floating" ? 18 : 20}
          className={cn(isLiked && "fill-current")}
        />
      </motion.div>

      {variant === "outline" && (
        <span className="text-sm font-medium">
          {isLiked ? "Saved" : "Save property"}
        </span>
      )}

      <AnimatePresence>
        {isLiked && isAnimating && (
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 2 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/20 rounded-full blur-md -z-10"
          />
        )}
      </AnimatePresence>
    </button>
  );
};

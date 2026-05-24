import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  savedPropertyIds: string[];
  toggleWishlist: (propertyId: string) => void;
  isInWishlist: (propertyId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      savedPropertyIds: [],
      toggleWishlist: (propertyId: string) => {
        if (!propertyId) return;
        const { savedPropertyIds } = get();
        if (savedPropertyIds.includes(propertyId)) {
          set({
            savedPropertyIds: savedPropertyIds.filter((id) => id !== propertyId),
          });
        } else {
          set({
            savedPropertyIds: [...savedPropertyIds, propertyId],
          });
        }
      },
      isInWishlist: (propertyId: string) => {
        if (!propertyId) return false;
        return get().savedPropertyIds.includes(propertyId);
      },
      clearWishlist: () => set({ savedPropertyIds: [] }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
);

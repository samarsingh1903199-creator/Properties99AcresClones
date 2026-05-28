import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { likedApi } from '../services/api';

interface WishlistState {
  savedPropertyIds: string[];
  synced: boolean;
  toggleWishlist: (propertyId: string, token?: string | null) => Promise<void>;
  isInWishlist: (propertyId: string) => boolean;
  syncFromServer: (token: string) => Promise<void>;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      savedPropertyIds: [],
      synced: false,

      toggleWishlist: async (propertyId: string, token?: string | null) => {
        if (!propertyId) return;

        // Optimistic update — flip immediately so UI responds instantly
        const previous = get().savedPropertyIds;
        const isLiked = previous.includes(propertyId);
        const optimistic = isLiked
          ? previous.filter((id) => id !== propertyId)
          : [...previous, propertyId];
        set({ savedPropertyIds: optimistic });

        if (token) {
          try {
            const res = await likedApi.toggle(propertyId, token);
            // Sync confirmed server state
            set({ savedPropertyIds: res.data });
          } catch {
            // Revert on error
            set({ savedPropertyIds: previous });
          }
        }
      },

      isInWishlist: (propertyId: string) => {
        if (!propertyId) return false;
        return get().savedPropertyIds.includes(propertyId);
      },

      syncFromServer: async (token: string) => {
        try {
          const res = await likedApi.getIds(token);
          set({ savedPropertyIds: res.data, synced: true });
        } catch {
          // keep local state on failure
        }
      },

      clearWishlist: () => set({ savedPropertyIds: [], synced: false }),
    }),
    { name: 'wishlist-storage' }
  )
);

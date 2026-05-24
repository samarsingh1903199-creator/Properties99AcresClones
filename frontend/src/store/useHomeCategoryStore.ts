import { create } from 'zustand';
import type { HomeCategoryId } from '@/src/components/home/CategoryTabs';

interface HomeCategoryState {
  pendingCategory: HomeCategoryId | null;
  setPendingCategory: (cat: HomeCategoryId | null) => void;
}

export const useHomeCategoryStore = create<HomeCategoryState>((set) => ({
  pendingCategory: null,
  setPendingCategory: (cat) => set({ pendingCategory: cat }),
}));

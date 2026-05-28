import { create } from 'zustand';
import type { Property } from '../types';

interface PropertiesState {
  properties: Property[];
  lastFetched: number | null;
  setProperties: (props: Property[]) => void;
}

export const usePropertiesStore = create<PropertiesState>((set) => ({
  properties: [],
  lastFetched: null,
  setProperties: (properties) => set({ properties, lastFetched: Date.now() }),
}));

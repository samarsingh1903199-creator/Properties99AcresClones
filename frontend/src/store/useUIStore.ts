import { create } from 'zustand';

export type BookingVisitType = 'physical' | 'video';

interface UIStore {
  isBookingModalOpen: boolean;
  bookingVisitType: BookingVisitType;
  openBookingModal: (visitType?: BookingVisitType, propertyId?: string) => void;
  closeBookingModal: () => void;
  selectedPropertyId: string | null;
  setSelectedPropertyId: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isBookingModalOpen: false,
  bookingVisitType: 'physical',
  openBookingModal: (visitType = 'physical', propertyId) =>
    set((state) => ({
      isBookingModalOpen: true,
      bookingVisitType: visitType,
      selectedPropertyId: propertyId ?? state.selectedPropertyId,
    })),
  closeBookingModal: () => set({ isBookingModalOpen: false }),
  selectedPropertyId: null,
  setSelectedPropertyId: (id) => set({ selectedPropertyId: id }),
}));

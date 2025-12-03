import { create } from "zustand";

export const useAuthDialog = create<{
  open: boolean;
  openDialog: () => void;
  closeDialog: () => void;
}>((set) => ({
  open: false,
  openDialog: () => set({ open: true }),
  closeDialog: () => set({ open: false }),
}));

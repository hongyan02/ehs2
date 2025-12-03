import { create } from "zustand";

interface UserInfoState {
  username: string;
  nickname: string;
  deptName: string;
  setInfo: (info: Partial<UserInfoState>) => void;
  clearInfo: () => void;
}

const useInfoStore = create<UserInfoState>((set) => ({
  username: "",
  nickname: "",
  deptName: "",
  setInfo: (info) => set((state) => ({ ...state, ...info })),
  clearInfo: () => set({ username: "", nickname: "", deptName: "" }),
}));

export default useInfoStore;

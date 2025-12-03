import { create } from "zustand";

export interface UserListItem {
    userId: number;
    userName: string;
    nickName: string;
    deptId: number;
    deptName?: string;
    email?: string;
    phonenumber?: string;
}

interface UserListState {
    userList: UserListItem[];
    setUserList: (users: UserListItem[]) => void;
    clearUserList: () => void;
}

const useUserListStore = create<UserListState>((set) => ({
    userList: [],
    setUserList: (users) => set({ userList: users }),
    clearUserList: () => set({ userList: [] }),
}));

export default useUserListStore;

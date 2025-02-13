import { create } from "zustand";
import { IUserModel } from "../models/models";

type UserState = {
  user: IUserModel | null;
  setUser: (user: IUserModel | null) => void;
};

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

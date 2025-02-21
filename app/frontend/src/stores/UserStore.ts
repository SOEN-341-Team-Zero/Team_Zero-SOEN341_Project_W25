import { create } from "zustand";
import { IUserModel } from "../models/models";

type UserState = {
  user: IUserModel | null;
  isUserAdmin: boolean;
  setUser: (user: IUserModel | null) => void;

  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
};

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  isUserAdmin: false,
  setUser: (user) => set({ user: user, isUserAdmin: user?.isAdmin }),

  isLoggedIn: false,
  setIsLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn: isLoggedIn }),
}));

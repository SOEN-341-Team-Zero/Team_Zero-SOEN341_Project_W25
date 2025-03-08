import { create } from "zustand";
import { IUserModel } from "../models/models";
import Cookies from "js-cookie";

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

  isLoggedIn: Cookies.get("isLoggedIn") === "true",
  setIsLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn: isLoggedIn }),
}));

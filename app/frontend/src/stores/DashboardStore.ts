import { create } from "zustand";

export enum DashboardTabs {
  Profile = "profile",
  Requests = "requests",
}

type DashboardState = {
  dashboardTab: DashboardTabs;
  setDashboardTab: (tab: DashboardTabs) => void;
};

export const useDashboardStore = create<DashboardState>()((set) => ({
  dashboardTab: DashboardTabs.Requests,
  setDashboardTab: (tab) => set({ dashboardTab: tab }),
}));

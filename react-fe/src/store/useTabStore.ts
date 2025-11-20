import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Tab = "upload" | "videos";

interface TabStore {
  currentTab: Tab;
  prevTab: Tab | null;
  setCurrentTab: (tab: Tab) => void;
}

export const useTabStore = create<TabStore>()(
  persist(
    (set) => ({
      currentTab: "upload",
      prevTab: null,
      setCurrentTab: (tab) =>
        set((state) => ({
          prevTab: state.currentTab,
          currentTab: tab,
        })),
    }),
    {
      name: "tab-storage", 
    }
  )
);

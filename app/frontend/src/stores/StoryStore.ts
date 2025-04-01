import { create } from "zustand";
import { IStoryModel } from "../models/models";

export type IStoryUserModel = {
    user_id: number;
    username: string;
}

type StoryState = {
  stories: IStoryModel[] | null;
  setStories: (stories: IStoryModel[] | null) => void;
};

export const useStoryStore = create<StoryState>()((set) => ({
  stories: [],
  setStories: (stories) => set({ stories: stories }),
}));

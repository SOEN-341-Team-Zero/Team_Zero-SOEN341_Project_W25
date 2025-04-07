import { create } from "zustand";
import { IStoryModel } from "../models/models";

export type IStoryUserModel = {
  user_id: number;
  username: string;
  last_story_at?: string;
};

type StoryState = {
  stories: IStoryModel[] | null;
  setStories: (stories: IStoryModel[] | null) => void;

  currentStory: IStoryModel | null;
  setCurrentStory: (story: IStoryModel | null) => void;

  selectedStoryUser: IStoryUserModel | null;
  setSelectedStoryUser: (user: IStoryUserModel | null) => void;

  currentStoryUserStories: IStoryModel[];
  setCurrentStoryUserStories: (stories: IStoryModel[]) => void;

  nextStory: () => void;
  prevStory: () => void;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;

  isFetching: boolean;
  setIsFetching: (isFetching: boolean) => void;
};

export const useStoryStore = create<StoryState>()((set) => ({
  stories: [],
  setStories: (stories) => set({ stories: stories }),

  currentStory: null,
  setCurrentStory: (story) => set({ currentStory: story }),

  selectedStoryUser: null,
  setSelectedStoryUser: (user) =>
    set((state) => {
      const oneDayAgo = new Date(); // get today's date
      oneDayAgo.setDate(oneDayAgo.getDate() - 1); // bam it's a day earlier

      const upcomingUserStories = state?.stories?.filter((story) => {
        if (!story.created_at) return false;
        return (
          story.user_id === user?.user_id &&
          new Date(story.created_at) > oneDayAgo
        );
      });

      return {
        currentIndex: 0,
        selectedStoryUser: user,
        currentStoryUserStories: upcomingUserStories,
        currentStory: upcomingUserStories?.[0] || null,
      };
    }),

  currentStoryUserStories: [],
  setCurrentStoryUserStories: (stories) =>
    set({ currentStoryUserStories: stories }),

  nextStory: () =>
    set((state) => {
      if (!state.currentStoryUserStories) return state;
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.currentStoryUserStories.length) return state;
      return {
        currentIndex: nextIndex,
        currentStory: state.currentStoryUserStories[nextIndex],
      };
    }),

  prevStory: () =>
    set((state) => {
      if (!state.currentStoryUserStories) return state;
      const prevIndex = state.currentIndex - 1;
      if (prevIndex < 0) return state;
      return {
        currentIndex: prevIndex,
        currentStory: state.currentStoryUserStories[prevIndex],
      };
    }),

  currentIndex: 0,
  setCurrentIndex: (index) => set({ currentIndex: index }),

  isFetching: false,
  setIsFetching: (isFetching) => set({ isFetching: isFetching }),
}));

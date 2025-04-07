import { Box } from "@mui/material";
import { useEffect } from "react";
import { toast } from "react-toastify";
import wretch from "wretch";
import { useStoryStore } from "../../stores/StoryStore";
import { API_URL } from "../../utils/FetchUtils";
import StoryCarousel from "./StoryCarousel";
import StoryViewer from "./StoryViewer";

export default function DashboardStoriesTabContent() {
  const storyState = useStoryStore();

  const fetchStories = () => {
    storyState.setIsFetching(true);
    wretch(`${API_URL}/api/story/stories`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .get()
      .json((response) => {
        storyState.setStories(response.stories);
      })
      .catch(() => {
        toast.error("An error occurred while fetching stories.");
      })
      .finally(() => {
        storyState.setIsFetching(false);
      });
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        maxHeight: "100%",
      }}
    >
      <StoryCarousel refetchStories={fetchStories} />
      <StoryViewer />
    </Box>
  );
}

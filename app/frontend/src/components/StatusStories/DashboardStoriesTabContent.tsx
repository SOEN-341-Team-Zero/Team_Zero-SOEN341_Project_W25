import { Box } from "@mui/material";
import { isMobile } from "../../utils/BrowserUtils";
import StoryCarousel from "./StoryCarousel";
import StoryViewer from "./StoryViewer";
import { useEffect, useState } from "react";
import wretch from "wretch";
import { API_URL } from "../../utils/FetchUtils";
import { IStoryModel } from "../../models/models";
import { toast } from "react-toastify";
import { useStoryStore } from "../../stores/StoryStore";

export default function DashboardStoriesTabContent() {
  const isUserMobile = isMobile();

  const storyState = useStoryStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStories = () => {
    setIsLoading(true);
    wretch(`${API_URL}/api/story/stories`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .get()
      .json((response) => {
        storyState.setStories(response.stories);
      })
      .catch((error) => {
        toast.error("An error occurred while fetching stories.");
      })
      .finally(() => {
        setIsLoading(false);
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
      <StoryCarousel />
      <StoryViewer />
    </Box>
  );
}

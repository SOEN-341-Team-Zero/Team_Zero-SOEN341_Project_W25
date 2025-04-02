import { Box, IconButton } from "@mui/material";
import { isMobile } from "../../utils/BrowserUtils";
import { useStoryStore } from "../../stores/StoryStore";
import { useEffect } from "react";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";

export default function StoryViewer() {
  const isUserMobile = isMobile();

  const storyState = useStoryStore();

  const fileUrl = storyState.currentStory?.url;

  const fileType = storyState.currentStory?.file_type;

  useEffect(() => {
    if (storyState.selectedStoryUser) {
      const selectedStoryUser = storyState.selectedStoryUser;
      const currentStory = storyState.stories?.find(
        (story) => story.user_id === selectedStoryUser.user_id,
      );
      storyState.setCurrentStory(currentStory || null);
    }
  }, [storyState.selectedStoryUser]);

  return (
    <Box
      className="story-viewer"
      p={0}
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        height: "100%",
        width: "100%",
        overflow: "hidden",
        maxHeight: isUserMobile ? "67vh" : "75vh",
      }}
    >
      <Box
        style={{
          width: "100%",
          height: "100%",
          maxHeight: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {fileType === "image" ? (
          <img
            style={{
              height: "100%",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
            src={fileUrl}
            alt="Story"
          />
        ) : fileType === "video" ? (
          <video
            autoPlay
            style={{
              height: "100%",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          >
            <source src={fileUrl} type="video/mp4" />
          </video>
        ) : null}

        {storyState.currentStory && (
          <Box
            className="story-viewer-controls"
            style={{
              position: "absolute",
              width: "98%",
              height: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <IconButton
              disabled={storyState.currentIndex === 0}
              style={{
                background: "rgba(0, 0, 0, 0.5)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                pointerEvents: "auto",
              }}
              onClick={() => storyState.prevStory()}
            >
              <NavigateBeforeIcon fontSize="large" />
            </IconButton>
            <IconButton
              disabled={
                storyState.currentIndex ===
                storyState.currentStoryUserStories.length - 1
              }
              style={{
                background: "rgba(0, 0, 0, 0.5)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                pointerEvents: "auto",
              }}
              onClick={() => storyState.nextStory()}
            >
              <NavigateNextIcon fontSize="large" />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
}

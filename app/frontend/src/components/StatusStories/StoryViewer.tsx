import {
  Avatar,
  Box,
  Grid2 as Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import { useStoryStore } from "../../stores/StoryStore";
import { isMobile } from "../../utils/BrowserUtils";

import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { stringAvatar } from "../../utils/AvatarUtils";
import { formatLastSeen } from "../../utils/TimeUtils";

import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";




export default function StoryViewer() {
  const isUserMobile = isMobile();

  const storyState = useStoryStore();

  const fileUrl = storyState.currentStory?.url;

  const fileType = storyState.currentStory?.file_type;

  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);

  const handleVideoClicked = () => {
    const video = videoPlayerRef.current;
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  };

  const renderMediaContent = () => {
    if (fileType === "image") {
      return (
        <img
          key={fileUrl}
          style={{
            height: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
          src={fileUrl}
          alt="Story"
        />
      );
    } else if (fileType === "video") {
      return (
        <video
          muted={isVideoMuted}
          key={fileUrl}
          id={"story-video-player"}
          ref={videoPlayerRef}
          onClick={handleVideoClicked}
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
      );
    }
    return null;
  };

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
        {renderMediaContent()}
        {storyState.currentStory && (
          <Box
            className="story-viewer-overlay"
            style={{
              position: "absolute",
              width: "96%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <Grid
              pt={2}
              sx={{ height: "100%", width: "100%", justifyItems: "start" }}
              container
            >
              <Grid
                size={12}
                sx={{ justifyContent: "space-between", display: "flex" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    maxHeight: "48px",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Avatar
                    {...stringAvatar(
                      storyState.currentStory.username ??  "ChatHaven User",
                      {
                        width: "44px",
                        height: "44px",
                        border: "2px solid #00000020",
                        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.5)",
                      },
                    )}
                  />
                  <Typography
                    sx={{
                      textShadow: "0px 1px 3px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    {storyState.currentStory.username}
                  </Typography>

                  <Typography
                    color={"secondary"}
                    sx={{
                      textShadow: "0px 1px 3px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    {formatLastSeen(storyState.currentStory.created_at ?? null)}
                  </Typography>
                </Box>
                <Box sx={{ pointerEvents: "auto" }}>
                  <IconButton onClick={() => setIsVideoMuted(!isVideoMuted)}>
                    {isVideoMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                  </IconButton>
                </Box>
              </Grid>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <IconButton
                  disabled={storyState.currentIndex === 0}
                  style={{
                    background: "rgba(0, 0, 0, 0.2)",
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
                    background: "rgba(0, 0, 0, 0.2)",
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
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
}

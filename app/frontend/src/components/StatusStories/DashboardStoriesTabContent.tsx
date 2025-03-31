import { Box } from "@mui/material";
import { isMobile } from "../../utils/BrowserUtils";
import StoryCarousel from "./StoryCarousel";
import StoryViewer from "./StoryViewer";

export default function DashboardStoriesTabContent() {
  const isUserMobile = isMobile();

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        maxHeight: "100%"
      }}
    >
        <StoryCarousel/>
        <StoryViewer />

    </Box>
  );
}

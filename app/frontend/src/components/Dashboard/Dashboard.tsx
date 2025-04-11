import { Box, Typography } from "@mui/material";
import { DashboardTabs, useDashboardStore } from "../../stores/DashboardStore";
import DashboardStoriesTabContent from "../StatusStories/DashboardStoriesTabContent";
import DashboardHeader from "./DashboardHeader";
import DashboardRequestsTabContent from "./DashboardRequestsTabContent";

export default function Dashboard() {
  const dashboardState = useDashboardStore();
  return (
    <Box flexGrow={1} display={"flex"} flexDirection="column" maxHeight="93%">
      <DashboardHeader />

      {dashboardState.dashboardTab === DashboardTabs.Requests && (
        <DashboardRequestsTabContent />
      )}

      {dashboardState.dashboardTab === DashboardTabs.Profile && (
        // <DashboardProfileTabContent />
        <Typography variant="h6" align="center" mt={2} color="textSecondary">
          Coming Soon (?)
        </Typography>
      )}

      {dashboardState.dashboardTab === DashboardTabs.Stories && (
        <DashboardStoriesTabContent />
      )}
    </Box>
  );
}

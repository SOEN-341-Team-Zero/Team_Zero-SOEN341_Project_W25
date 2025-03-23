import { Box } from "@mui/material";
import { DashboardTabs, useDashboardStore } from "../../stores/DashboardStore";
import DashboardHeader from "./DashboardHeader";
import DashboardRequestsTabContent from "./DashboardRequestsTabContent";
import { Typography } from "@mui/material";

export default function Dashboard() {
  const dashboardState = useDashboardStore();
  return (
    <Box>
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
    </Box>
  );
}

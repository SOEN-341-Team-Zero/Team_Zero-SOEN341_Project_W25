import { Box } from "@mui/material";
import { DashboardTabs, useDashboardStore } from "../../stores/DashboardStore";
import DashboardHeader from "./DashboardHeader";
import DashboardRequestsTabContent from "./DashboardRequestsTabContent";

export default function Dashboard() {
  const dashboardState = useDashboardStore();
  return (
    <Box>
      <DashboardHeader />

      {dashboardState.dashboardTab === DashboardTabs.Requests &&
      
        <DashboardRequestsTabContent />


      }

    {/* {dashboardState.dashboardTab === DashboardTabs.Profile &&
      
      <DashboardProfileTabContent />


    } */}


    </Box>
  );
}

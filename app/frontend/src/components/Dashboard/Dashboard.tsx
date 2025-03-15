import { Box } from "@mui/material";
import { useDashboardStore } from "../../stores/DashboardStore";

export default function Dashboard() {
  const dashboardState = useDashboardStore();
  return <Box>{dashboardState.dashboardTab}</Box>;
}

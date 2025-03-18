import { Box, Divider, Grid2 as Grid, Typography } from "@mui/material";
import "../../styles/ChatArea.css";
import { useDashboardStore } from "../../stores/DashboardStore";

export default function DashboardHeader() {
  const dashboardState = useDashboardStore();

  return (
    <Grid
      container
      className={"channel-title-bar"}
      style={{ display: "flex", alignItems: "center" }}
    >
      <Grid size={{ xs: 12 }} style={{ display: "flex", alignItems: "center" }}>
        <Typography
          style={{
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            flexShrink: 0,
          }}
        >
          {dashboardState.dashboardTab}
        </Typography>
      </Grid>
    </Grid>
  );
}

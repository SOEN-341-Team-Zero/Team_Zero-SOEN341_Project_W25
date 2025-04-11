import { Grid2 as Grid, Typography } from "@mui/material";
import { useDashboardStore } from "../../stores/DashboardStore";
import "../../styles/ChatArea.css";

export default function DashboardHeader() {
  const dashboardState = useDashboardStore();

  const getText = () => {
    switch (dashboardState.dashboardTab) {
      case "requests":
        return "Requests and Users";
      case "stories":
        return "Stories";
      case "profile":
        return "Your Profile";
      default:
        return "Dashboard";
    }
  };

  return (
    <Grid
      container
      className={"channel-title-bar"}
      style={{
        display: "flex",
        alignItems: "center",
        minHeight: "52px", // Ensure the header has a minimum height
      }}
    >
      <Grid size={{ xs: 12 }} style={{ display: "flex", alignItems: "center" }}>
        <Typography
          style={{
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            flexShrink: 0,
          }}
        >
          {getText()}
        </Typography>
      </Grid>
    </Grid>
  );
}

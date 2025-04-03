import { Box, List, ListItemButton, Typography } from "@mui/material";
import { DashboardTabs, useDashboardStore } from "../../stores/DashboardStore";
import { useNavigate } from "react-router-dom";

export default function DashboardSidebarContent() {
  const setDashboardTab = useDashboardStore((state) => state.setDashboardTab);
  const navigate = useNavigate();

  return (
    <>
      <Box
        className={"selected-team-title"}
        alignContent={"center"}
        justifyItems="center"
      >
        <Typography
          noWrap
          onClick={(e) => {
            e.stopPropagation();
            setTimeout(() => window.location.reload(), 500);
            navigate("/");
          }}
        >
          {"ChatHaven"}
        </Typography>
      </Box>

      <List className="dashboard-action-list">
        <ListItemButton
          className={"dashboard-list-item"}
          onClick={() => setDashboardTab(DashboardTabs.Profile)}
          key="dashboard-btn-profile"
        >
          {"Your Profile"}
        </ListItemButton>
        <ListItemButton
          className={"dashboard-list-item"}
          onClick={() => setDashboardTab(DashboardTabs.Requests)}
          key="dashboard-btn-requests"
        >
          {"Requests and Users"}
        </ListItemButton>
        <ListItemButton
          className={"dashboard-list-item"}
          onClick={() => setDashboardTab(DashboardTabs.Stories)}
          key="dashboard-btn-stories"
        >
          {"Stories"}
        </ListItemButton>
      </List>
    </>
  );
}

import { Box, List, ListItemButton, Typography } from "@mui/material";
import { DashboardTabs, useDashboardStore } from "../../stores/DashboardStore";

export default function DashboardSidebarContent() {
  const setDashboardTab = useDashboardStore((state) => state.setDashboardTab);

  return (
    <>
      <Box
        className={"selected-team-title"}
        alignContent={"center"}
        justifyItems="center"
      >
        <Typography noWrap>{"ChatHaven"}</Typography>
      </Box>

      <List className="dashboard-action-list">
        <ListItemButton onClick={()=>setDashboardTab(DashboardTabs.Profile)}key="dashboard-btn-profile">
          {"Your Profile"}
        </ListItemButton>
        <ListItemButton onClick={()=>setDashboardTab(DashboardTabs.Requests)} key="dashboard-btn-requests">
          {"Requests and Users"}
        </ListItemButton>
      </List>
    </>
  );
}

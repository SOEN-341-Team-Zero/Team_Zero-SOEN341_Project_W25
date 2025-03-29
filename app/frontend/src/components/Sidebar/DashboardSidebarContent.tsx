import { Box, List, ListItemButton, Typography } from "@mui/material";
import { DashboardTabs, useDashboardStore } from "../../stores/DashboardStore";
import { useNavigate } from 'react-router-dom';

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
        <Typography noWrap onClick={() => navigate('/')}>{"ChatHaven"}</Typography>
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

import { Box, List, ListItemButton, Typography } from "@mui/material";

export default function DashboardSidebarContent() {
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
        <ListItemButton key="dashboard-btn-profile">
          {"Your Profile"}
        </ListItemButton>
        <ListItemButton key="dashboard-btn-requests">
          {"Requests and Users"}
        </ListItemButton>
      </List>
    </>
  );
}

import { Grid2 as Grid } from "@mui/material";
import { useApplicationStore, ViewModes } from "../../stores/ApplicationStore";
import DashboardSidebarContent from "./DashboardSidebarContent";
import DMSidebarContent from "./DMSidebarContent";
import TeamSidebarContent from "./TeamSidebarContent";

export default function SideBarSecondaryPanel() {
  const currentViewMode = useApplicationStore((state) => state.viewMode);

  return (
    <Grid
      className={"sidebar-secondary-panel panel"}
      size={8.6}
      justifyItems={"left"}
      container
      direction={"column"}
      overflow={"hidden"}
    >
      {currentViewMode === ViewModes.Team && <TeamSidebarContent />}

      {currentViewMode === ViewModes.DirectMessage && <DMSidebarContent />}

      {currentViewMode === ViewModes.Dashboard && <DashboardSidebarContent />}
    </Grid>
  );
}

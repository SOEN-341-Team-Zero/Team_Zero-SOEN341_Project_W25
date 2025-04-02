import ChatIcon from "@mui/icons-material/Chat";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";

import Cookies from "js-cookie";

import {
  Box,
  Divider,
  Grid2 as Grid,
  IconButton,
  List,
  ListItem,
  SwipeableDrawer,
  Tooltip,
} from "@mui/material";

import { ITeamModel, UserActivity } from "../../models/models";

import GroupsIcon from "@mui/icons-material/Groups";
import { useNavigate } from "react-router-dom";
import { useApplicationStore, ViewModes } from "../../stores/ApplicationStore";
import { useUserStore } from "../../stores/UserStore";
import "../../styles/SideBar.css";
import { activitySubmit } from "../../utils/ActivityUtils";
import CreateTeamButton from "../Buttons/CreateTeamButton";
import SideBarSecondaryPanel from "./SideBarSecondaryPanel";

interface ISideBarProps {
  drawerVariant: "permanent" | "persistent" | "temporary";
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isDrawerOpen: boolean) => void;
  isUserAdmin: boolean;
}

export default function SideBar(props: ISideBarProps) {
  const DRAWER_WIDTH = 350;

  const applicationState = useApplicationStore();

  const setIsLoggedIn = useUserStore((state) => state.setIsLoggedIn);

  const navigate = useNavigate();

  const handleLogOut = () => {
    activitySubmit(UserActivity.Offline);
    setTimeout(() => {
      Cookies.remove("isLoggedIn");
      localStorage.removeItem("jwt-token");
      setIsLoggedIn(false);
      navigate("/login");
    }, 100);
  };

  const handleTeamSelected = (team: ITeamModel) => {
    applicationState.setViewMode(ViewModes.Team);
    applicationState.setSelectedTeam(team);
  };

  // check for iOS because they have swipe-to navigate back
  // solution provided by MUI https://mui.com/material-ui/react-drawer/#swipeable
  const iOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <SwipeableDrawer
      disableSwipeToOpen={iOS}
      disableBackdropTransition={!iOS}
      variant={props.drawerVariant}
      open={props.isDrawerOpen}
      onOpen={() => props.setIsDrawerOpen(true)}
      onClose={() => props.setIsDrawerOpen(false)}
      ModalProps={{
        keepMounted: true,
      }}
      swipeAreaWidth={50}
      sx={{
        minWidth: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          backgroundColor:
            props.drawerVariant === "permanent" ? "transparent" : "#324a39",
        },
      }}
    >
      <Grid container height={"100%"} width={"100%"}>
        <Grid
          className={"team-bar panel"}
          container
          size={2.5}
          justifyItems={"center"}
          justifyContent={"space-between"}
          direction={"column"}
          overflow={"hidden"}
        >
          <Grid>
            <Box
              width={"100%"}
              height={"128px"}
              alignContent={"center"}
              justifyItems={"center"}
            >
              <IconButton
                onClick={() =>
                  applicationState.setViewMode(ViewModes.Dashboard)
                }
                disableFocusRipple
                data-testid="sidebar-dashboard-button"
              >
                <PersonIcon></PersonIcon>
              </IconButton>

              <Box height={"8px"} />

              <Tooltip title="Direct Messages" placement="right">
                <IconButton
                  onClick={() =>
                    applicationState.setViewMode(ViewModes.DirectMessage)
                  }
                  disableFocusRipple
                  data-testid="direct-messages-button"
                >
                  <ChatIcon></ChatIcon>
                </IconButton>
              </Tooltip>
            </Box>
            <Divider variant="middle" />
          </Grid>
          <List
            disablePadding
            sx={{
              maxWidth: "100%",
              height: props.isUserAdmin
                ? "calc(100vh - 334px)"
                : "calc(100vh - 272px)",
              overflowY: "scroll",
              scrollbarWidth: "none", // firefox
              "&::-webkit-scrollbar": {
                display: "none", // chrome, safari, opera
              },
            }}
          >
            {applicationState.teams
              .sort((a, b) => {
                if (a.team_id === 0) return -1;
                if (b.team_id === 0) return 1;
                return 0;
              })
              .map((team: ITeamModel) => (
                <ListItem key={team.team_id}>
                  <Tooltip placement="right" title={team.team_name}>
                    <IconButton
                      disableFocusRipple
                      onClick={() => handleTeamSelected(team)}
                    >
                      <GroupsIcon />
                    </IconButton>
                  </Tooltip>
                </ListItem>
              ))}
          </List>
          <Grid>
            <Divider variant="middle" />
            <Box
              width={"100%"}
              height={props.isUserAdmin ? "190px" : "130px"}
              justifyItems="center"
              alignContent={"center"}
            >
              {props.isUserAdmin && (
                <>
                  <CreateTeamButton />
                  <Box height={"8px"} />
                </>
              )}
              <IconButton disableFocusRipple data-testid="settings-button">
                <SettingsIcon></SettingsIcon>
              </IconButton>
              <Box height={"8px"} />

              <Tooltip placement="right" title="Log out">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogOut();
                  }}
                  data-testid="sidebar-logout-button"
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
        <SideBarSecondaryPanel />
      </Grid>
    </SwipeableDrawer>
  );
}

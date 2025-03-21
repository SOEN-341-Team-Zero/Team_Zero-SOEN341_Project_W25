import ChatIcon from "@mui/icons-material/Chat";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";

import {
  Box,
  Divider,
  Grid2 as Grid,
  IconButton,
  List,
  SwipeableDrawer,
  Tooltip,
  ListItem,

} from "@mui/material";

import { ITeamModel } from "../../models/models";

import Cookies from "js-cookie";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore, ViewModes } from "../../stores/ApplicationStore";
import { useUserStore } from "../../stores/UserStore";
import "../../styles/SideBar.css";
import CreateTeamButton from "../Buttons/CreateTeamButton";
import SideBarSecondaryPanel from "./SideBarSecondaryPanel";
import GroupsIcon from "@mui/icons-material/Groups";

interface ISideBarProps {
  drawerVariant: "permanent" | "persistent" | "temporary";
  drawerOpen: boolean;
  handleDrawerToggle: () => void;
  isUserAdmin: boolean;
  logout: () => void;
}

export default function SideBar(props: ISideBarProps) {
  const DRAWER_WIDTH = 350;

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const applicationState = useApplicationStore();

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event &&
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      setIsDrawerOpen(open);
    };

  const navigate = useNavigate();
  const setIsLoggedIn = useUserStore((state) => state.setIsLoggedIn);

  const logOut = () => {
    props.logout();
    Cookies.remove("isLoggedIn");
    localStorage.removeItem("jwt-token");
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleTeamSelected = (team: ITeamModel) => {
    applicationState.setViewMode(ViewModes.Team);
    applicationState.setSelectedTeam(team);
  };

  return (
    <SwipeableDrawer
      variant={props.drawerVariant}
      open={isDrawerOpen}
      onOpen={toggleDrawer(true)}
      onClose={toggleDrawer(false)}
      ModalProps={{
        keepMounted: true,
      }}
      swipeAreaWidth={60}
      sx={{
        minWidth: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          backgroundColor: "transparent",
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
              <IconButton disableFocusRipple>
                <PersonIcon></PersonIcon>
              </IconButton>

              <Box height={"8px"} />

              <Tooltip title="Direct Messages" placement="right">
                <IconButton
                  onClick={() =>
                    applicationState.setViewMode(ViewModes.DirectMessage)
                  }
                  disableFocusRipple
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
  {applicationState.teams.sort((a, b) => {
    if (a.team_id === 0) return -1;
    if (b.team_id === 0) return 1;
    return 0;
  }).map((team: ITeamModel) => (
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
              <IconButton disableFocusRipple>
                <SettingsIcon></SettingsIcon>
              </IconButton>
              <Box height={"8px"} />

              <Tooltip placement="right" title="Log out">
                <IconButton onClick={logOut}>
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

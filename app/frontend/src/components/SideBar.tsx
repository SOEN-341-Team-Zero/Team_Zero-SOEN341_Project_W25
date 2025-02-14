import ChatIcon from "@mui/icons-material/Chat";
import GroupsIcon from "@mui/icons-material/Groups";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Box,
  Divider,
  Grid2 as Grid,
  IconButton,
  List,
  ListItem,
  SwipeableDrawer,
  Tooltip,
  Typography,
} from "@mui/material";

import { IChannelModel, ITeamModel } from "../models/models";

import Cookies from "js-cookie";

import { useState } from "react";
import { useApplicationStore } from "../stores/ApplicationStore";
import "../styles/SideBar.css";
import ChannelListItem from "./ChannelListItem";
import CreateChannelButton from "./CreateChannelButton";
import CreateTeamButton from "./CreateTeamButton";
import InviteToTeamButton from "./InviteToTeamButton";

interface ISideBarProps {
  drawerVariant: "permanent" | "persistent" | "temporary";
  drawerOpen: boolean;
  handleDrawerToggle: () => void;
  isUserAdmin: boolean;
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

  const logOut = () => {
    Cookies.remove("isLoggedIn");
    localStorage.removeItem("jwt-token");
    window.location.href = "http://localhost:5173"; // modify this later probably
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

              <IconButton disableFocusRipple>
                <ChatIcon></ChatIcon>
              </IconButton>
            </Box>
            <Divider variant="middle" />
          </Grid>
          <List
          disablePadding
            sx={{
              maxWidth: "100%",
              height: props.isUserAdmin
                ? "calc(100vh - 336px)"
                : "calc(100vh - 266px)",
              overflowY: "scroll",
              scrollbarWidth: "none", // firefox
              "&::-webkit-scrollbar": {
                display: "none", // chrome, safari, opera
              },
            }}
          >
            {applicationState.teams.map((team: ITeamModel) => {
              return (
                <ListItem key={team.team_id}>
                  <Tooltip placement="right" title={team.team_name}>
                    <IconButton
                      disableFocusRipple
                      onClick={() => applicationState.setSelectedTeam(team)}
                    >
                      <GroupsIcon />
                    </IconButton>
                  </Tooltip>
                </ListItem>
              );
            })}
          </List>
          <Grid>
            <Divider variant="middle" />
            <Box
              width={"100%"}
              height={props.isUserAdmin ? "190px" : "120px"}
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

        <Grid
          className={"channel-bar panel"}
          size={8.6}
          justifyItems={"left"}
          container
          direction={"column"}
          overflow={"hidden"}
          justifyContent={"space-between"}
        >
          <Box
            className={"selected-team-title"}
            alignContent={"center"}
            justifyItems="center"
          >
            <Typography noWrap>
              {applicationState.selectedTeam?.team_name}
            </Typography>
          </Box>
          <Divider variant="middle" />

          <List
            sx={{
              maxWidth: "100%",
              height: props.isUserAdmin
                ? "calc(100vh - 160px)"
                : "calc(100vh - 94px)",
              overflowY: "scroll",
              scrollbarWidth: "none", // firefox
              "&::-webkit-scrollbar": {
                display: "none", // chrome, safari, opera
              },
            }}
          >
            {applicationState.channels.map(
              (channel: IChannelModel) =>
                channel.team_id === applicationState.selectedTeam?.team_id && (
                  <ChannelListItem
                    key={channel.id}
                    isUserAdmin={props.isUserAdmin}
                    channel={channel}
                  />
                ),
            )}
          </List>

          <Divider variant="middle" />
          {applicationState.selectedTeam && props.isUserAdmin && (
            <Grid
              className={"team-actions"}
              container
              p="8px"
              justifyContent="space-between"
              width={"100%"}
              spacing={1}
            >
              <CreateChannelButton
                teamId={applicationState.selectedTeam?.team_id ?? -1}
              />

              <InviteToTeamButton
                teamId={applicationState.selectedTeam?.team_id ?? -1}
                teamName={
                  applicationState.selectedTeam?.team_name ?? "this team"
                }
              />
            </Grid>
          )}
        </Grid>
      </Grid>
    </SwipeableDrawer>
  );
}

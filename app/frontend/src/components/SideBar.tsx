import {
  Drawer,
  Grid2 as Grid,
  List,
  ListItem,
  IconButton,
  Box,
  ListItemButton,
  ListItemText,
  Tooltip,
  Divider,
  Typography,
  SwipeableDrawer,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import ChatIcon from "@mui/icons-material/Chat";
import GroupsIcon from "@mui/icons-material/Groups";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { IChannelModel, ITeamModel } from "../models/models";

import Cookies from "js-cookie";

import "../styles/SideBar.css";
import { useState } from "react";
import CreateTeamButton from "./CreateTeamButton";

interface ISideBarProps {
  teams: ITeamModel[];
  channels: IChannelModel[];
  selectedTeam: ITeamModel | undefined;
  selectedChannel: IChannelModel | undefined;

  setSelectedTeam: (team: ITeamModel) => void;
  setSelectedChannel: (channel: IChannelModel) => void;

  drawerVariant: "permanent" | "persistent" | "temporary";
  drawerOpen: boolean;
  handleDrawerToggle: () => void;

  refetchData: () => void;
}

export default function SideBar(props: ISideBarProps) {
  const DRAWER_WIDTH = 350;

  const [state, setState] = useState<boolean>(false);

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

      setState(open);
    };

  const logOut = () => {
    Cookies.remove("isLoggedIn");
    localStorage.removeItem("jwt-token");
    window.location.href = "http://localhost:5173"; // modify this later probably
  };

  return (
    <SwipeableDrawer
      variant={props.drawerVariant}
      open={state}
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
          className={"team-bar"}
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
            sx={{
              maxWidth: "100%",
              height: "calc(100vh - 360px)",
              overflowY: "scroll",
              scrollbarWidth: "none", // firefox
              "&::-webkit-scrollbar": {
                display: "none", // chrome, safari, opera
              },
            }}
          >
            {props.teams.map((team: ITeamModel) => {
              return (
                <ListItem key={team.team_id}>
                  <Tooltip placement="right" title={team.team_name}>
                    <IconButton
                      disableFocusRipple
                      onClick={() => props.setSelectedTeam(team)}
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
            <Box width={"100%"} height={"204px"} alignContent={"center"}>
              <CreateTeamButton refetchData={props.refetchData} />

              <Box height={"8px"} />

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
          className={"channel-bar"}
          size={8.6}
          justifyItems={"left"}
          container
          direction={"column"}
          overflow={"hidden"}
        >
          <Box
            className={"selected-team-title"}
            alignContent={"center"}
            justifyItems="center"
          >
            <Typography noWrap>{props.selectedTeam?.team_name}</Typography>
          </Box>
          <Divider variant="middle" />

          <List sx={{ width: "100%" }}>
            {props.channels.map(
              (channel: IChannelModel) =>
                channel.team_id === props.selectedTeam?.team_id && (
                  <ListItemButton
                    className="channel-item"
                    key={channel.id}
                    onClick={() => props.setSelectedChannel(channel)}
                  >
                    <ListItemText
                      primary={channel.channel_name}
                      slotProps={{ primary: { noWrap: true } }}
                    />
                  </ListItemButton>
                ),
            )}
          </List>
        </Grid>
      </Grid>
    </SwipeableDrawer>
  );
}

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
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import ChatIcon from "@mui/icons-material/Chat";
import GroupsIcon from "@mui/icons-material/Groups";
import SettingsIcon from "@mui/icons-material/Settings";
import { ITeamModel } from "../models/models";

import "../styles/SideBar.css";

interface ISideBarProps {
  teams: ITeamModel[];
  drawerVariant: "permanent" | "persistent" | "temporary";
  drawerOpen: boolean;
  handleDrawerToggle?: () => void;
}

export default function SideBar(props: ISideBarProps) {
  const DRAWER_WIDTH = 340;

  return (
    <Drawer
      variant={props.drawerVariant}
      open={props.drawerOpen}
      onClose={props.handleDrawerToggle}
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
          <List
            sx={{
              maxWidth: "100%",
              maxHeight: "calc(100vh - 90px)",
              overflowY: "scroll",
              scrollbarWidth: "none", // firefox
              "&::-webkit-scrollbar": {
                display: "none", // chrome, safari, opera
              },
            }}
          >
            <ListItem>
              <IconButton disableFocusRipple>
                <PersonIcon></PersonIcon>
              </IconButton>
            </ListItem>

            <ListItem>
              <IconButton disableFocusRipple>
                <ChatIcon></ChatIcon>
              </IconButton>
            </ListItem>

            <Divider />
            {props.teams.map((team: ITeamModel) => {
              return (
                <ListItem key={team.team_id}>
                  <Tooltip placement="right" title={team.team_name}>
                    <IconButton disableFocusRipple>
                      <GroupsIcon />
                    </IconButton>
                  </Tooltip>
                </ListItem>
              );
            })}
          </List>
          <Grid>
            <Divider />
            <Box width={"100%"} height={"70px"} alignContent={"center"}>
              <IconButton disableFocusRipple>
                <SettingsIcon></SettingsIcon>
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Grid className={"channel-bar"} size={9.5} justifyItems={"left"}>
          <List sx={{ width: "100%" }}>
            {["Home", "About", "Contact"].map((text, index) => (
              <ListItemButton key={text}>
                <ListItemText primary={text} />
              </ListItemButton>
            ))}
          </List>
        </Grid>
      </Grid>
    </Drawer>
  );
}

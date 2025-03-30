import { Box, useMediaQuery, useTheme } from "@mui/material";

import { useEffect, useState, useRef } from "react";
import SideBar from "../components/Sidebar/SideBar";
import { UserActivity, ITeamModel, IUserModel } from "../models/models";
import Cookies from "js-cookie";

import wretch from "wretch";
import ChatArea from "../components/Chat/ChatArea";
import { useApplicationStore } from "../stores/ApplicationStore";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/UserStore";
import { API_URL } from "../utils/FetchUtils";
import { activitySubmit } from "../utils/ActivityUtils";

export default function HomePage() {
  const theme = useTheme();
  const isBrowser = useMediaQuery(theme.breakpoints.up("sm"));

  // stores for state management
  const applicationState = useApplicationStore();
  const userState = useUserStore();

  // use effect with empty dependency array only runs once - on mount.
  useEffect(() => {
    fetchTeamAndChannelData();
  }, []);

  const fetchTeamAndChannelData = () => {
    wretch(`${API_URL}/api/home/index`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .get()
      .json((res: { user: IUserModel; teams: ITeamModel[] }) => loadData(res))
      .catch((err) => console.error(err));
  };

  const loadData = (data: { user: IUserModel; teams: ITeamModel[] }) => {
    userState.setUser(data.user);

    applicationState.setTeams(
      data.teams.map((team: any) => ({
        team_id: team.team_id,
        team_name: team.team_name,
      })),
    );

    applicationState.setChannels(
      data.teams.flatMap((team: any) =>
        team.channels.map((channel: any) => ({
          ...channel,
          team_id: team.team_id,
        })),
      ),
    );
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawerVariant = isBrowser ? "permanent" : "temporary";

  return (
    <Box
      style={{
        display: "flex",
        height: isBrowser ? "100vh" : "auto",
        width: "100vw",
      }}
    >
      <SideBar
        isUserAdmin={Boolean(userState.user?.isAdmin)}
        drawerVariant={drawerVariant}
        drawerOpen={drawerOpen}
        handleDrawerToggle={handleDrawerToggle}
      />
      <ChatArea isUserAdmin={Boolean(userState.user?.isAdmin)} />
    </Box>
  );
}

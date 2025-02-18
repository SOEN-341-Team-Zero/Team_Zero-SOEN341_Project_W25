import {
  Box,
  Button,
  Grid2 as Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { useEffect, useState } from "react";
import { ITeamModel, IUserModel } from "../models/models";
import SideBar from "./SideBar";

import wretch from "wretch";
import { useApplicationStore } from "../stores/ApplicationStore";
import { useUserStore } from "../stores/UserStore";
import ChatArea from "./ChatArea";

export default function HomePage() {
  const theme = useTheme();
  const isBrowser = useMediaQuery(theme.breakpoints.up("sm"));

  // stores for state management
  const applicationState = useApplicationStore();
  const userState = useUserStore();

  // retrieves data on home page load for the first time
  useEffect(() => {
    fetchTeamAndChannelData();
  }, []);

  const fetchTeamAndChannelData = () => {
    wretch(`http://localhost:3001/api/home/index`)
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

  const authedApiTest = async () => {
    // API TEST ENDPOINT!
    try {
      const response = await fetch(`http://localhost:3001/api/home/auth-test`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt-token")}`, // you NEED to add this token for each request
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log("AUTH TEST SUCCESSFUL");
      } else {
        console.error("Error:", data);
      }
    } catch (error) {
      console.error("Network Error:", error);
    }
  };
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawerVariant = isBrowser ? "permanent" : "temporary";

  return (
    <Box style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <SideBar
        isUserAdmin={Boolean(userState.user?.isAdmin)}
        drawerVariant={drawerVariant}
        drawerOpen={drawerOpen}
        handleDrawerToggle={handleDrawerToggle}
      />
      <ChatArea isUserAdmin = {Boolean(userState.user?.isAdmin)}/>
    </Box>
  );
}

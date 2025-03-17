import {
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { useEffect, useState, useRef } from "react";
import { ITeamModel, IUserModel } from "../models/models";
import SideBar from "../components/Sidebar/SideBar";

import wretch from "wretch";
import { useApplicationStore } from "../stores/ApplicationStore";
import { useUserStore } from "../stores/UserStore";
import ChatArea from "../components/Chat/ChatArea";
import { API_URL } from "../utils/FetchUtils";

export default function HomePage() {
  const theme = useTheme();
  const isBrowser = useMediaQuery(theme.breakpoints.up("sm"));

  // stores for state management
  const applicationState = useApplicationStore();
  const userState = useUserStore();
  let activity: string = "Offline";
  const [time, setTime] = useState<number>(Date.now());
  const activityTimeout = useRef<number | null>(null);

  const activitySubmit = (status: string) => {wretch(`${API_URL}/api/home/activity`)
            .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
            .post({Activity: status})
            .res(() => {})
            .catch((error) => {console.error("Error submitting activity:", error);});}

  

  const activitySubmitDebounced = (status: string) => {
    if (activityTimeout.current) clearTimeout(activityTimeout.current);
      activityTimeout.current = window.setTimeout(() => {
        activitySubmit(status);
      }, 100);
    };
  /*document.addEventListener("mousemove", () => {
    if(activity !== "Online") activitySubmitDebounced("Online");
    activity = "Online";
    setTime(Date.now())
  });*/
  document.addEventListener("keydown", () => {
    if(activity !== "Online") activitySubmitDebounced("Online");
    activity = "Online";
    setTime(Date.now())
  });
  document.addEventListener("click", () => {
    if(activity !== "Online") activitySubmitDebounced("Online");
    activity = "Online";
    setTime(Date.now())
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - time > 300000) {
        if (activity !== "Away") {
          activitySubmit("Away");
          activity = "Away";
        }
        clearInterval(interval);
      }
    }, 1000);
  
    return () => clearInterval(interval);
  }, [time, activity]);

  // retrieves data on home page load for the first time
  useEffect(() => {
    fetchTeamAndChannelData();
    const interval = setInterval(() => {
      if (Number(localStorage.getItem("cookie-expiry")) - Date.now() < 2000) {
        activitySubmit("Offline");
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTeamAndChannelData = () => {wretch(`${API_URL}/api/home/index`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .get()
      .json((res: { user: IUserModel; teams: ITeamModel[] }) => loadData(res))
      .catch((err) => console.error(err));};

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
        logout={() => {activity = "Offline"; activitySubmit("Offline");}}
      />
      <ChatArea isUserAdmin={Boolean(userState.user?.isAdmin)} />
    </Box>
  );
}

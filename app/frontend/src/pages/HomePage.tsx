import {
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { useEffect, useState } from "react";
import { ITeamModel, IUserModel } from "../models/models";
import SideBar from "../components/Sidebar/SideBar";

import wretch from "wretch";
import { useApplicationStore } from "../stores/ApplicationStore";
import { useUserStore } from "../stores/UserStore";
import ChatArea from "../components/Chat/ChatArea";
import { API_URL } from "../utils/FetchUtils";

enum Activity {
  Online = "Online",
  Away = "Away",
  Offline = "Offline"
}

export default function HomePage() {
  const theme = useTheme();
  const isBrowser = useMediaQuery(theme.breakpoints.up("sm"));

  // stores for state management
  const applicationState = useApplicationStore();
  const userState = useUserStore();
  const [activity, setActivity] = useState<Activity>(Activity.Online);
  const [time, setTime] = useState<number>(Date.now());

  const activitySubmit = (status: Activity) => {
    wretch(`${API_URL}/api/home/activity`)
            .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
            .post(JSON.stringify(status))
            .res(() => {})
            .catch((error) => {});
  }

  document.addEventListener("mousemove", () => {
    if(activity !== Activity.Online) activitySubmit(Activity.Online);
    setActivity(Activity.Online);
  });
  document.addEventListener("keydown", () => {
    if(activity !== Activity.Online) activitySubmit(Activity.Online);
    setActivity(Activity.Online);
  });
  document.addEventListener("click", () => {
    if(activity !== Activity.Online) activitySubmit(Activity.Online);
    setActivity(Activity.Online);
  });

  useEffect(() => {if(activity === Activity.Online) setTime(Date.now());}, [activity]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - time > 300000) {
        if (activity !== Activity.Away) {
          activitySubmit(Activity.Away);
          setActivity(Activity.Away);
        }
        clearInterval(interval);
      }
    }, 1000);
  
    return () => clearInterval(interval);
  }, [time, activity]);

  // retrieves data on home page load for the first time
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
        logout={() => {setActivity(Activity.Offline)}}
      />
      <ChatArea isUserAdmin={Boolean(userState.user?.isAdmin)} />
    </Box>
  );
}

import { Box, useMediaQuery, useTheme } from "@mui/material";

import { useEffect, useState } from "react";
import SideBar from "../components/Sidebar/SideBar";
import { UserActivity, ITeamModel, IUserModel } from "../models/models";
import Cookies from "js-cookie";

import wretch from "wretch";
import ChatArea from "../components/Chat/ChatArea";
import { useApplicationStore } from "../stores/ApplicationStore";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/UserStore";
import { API_URL } from "../utils/FetchUtils";

export default function HomePage() {
  const theme = useTheme();
  const isBrowser = useMediaQuery(theme.breakpoints.up("sm"));
  const navigate = useNavigate();
  const setIsLoggedIn = useUserStore((state) => state.setIsLoggedIn);

  // stores for state management
  const applicationState = useApplicationStore();
  const userState = useUserStore();
  const [activity, setActivity] = useState<string>(UserActivity.Online);
  const [lastUpdate, setLastUpdate] = useState<Date>();

  const setupActivityListeners = () => {
    document.addEventListener("keydown", () => {activitySubmit(UserActivity.Online);});
    document.addEventListener("click", () => {activitySubmit(UserActivity.Online);});
  };

  const removeActivityListeners = () => {
    document.removeEventListener("keydown", () => {activitySubmit(UserActivity.Online);});
    document.removeEventListener("click", () => {activitySubmit(UserActivity.Online);});
  };

  const activitySubmit = (status: string) => {
    if(Date.now() - (lastUpdate?.getTime() ?? Date.now() - 10000) < 1000) return;
    setActivity(status);
    setLastUpdate(new Date(Date.now()));
    wretch(`${API_URL}/api/home/activity`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .post({ Activity: status })
      .res(() => {
        if(status == "Offline") {
          window.location.reload();
          Cookies.remove("isLoggedIn");
          localStorage.removeItem("jwt-token");
          setIsLoggedIn(false);
          navigate("/login");
        }
      })
      .catch((error) => {
        console.error("Error submitting activity:", error);
      });
  };

  useEffect(() => activitySubmit("Online"), [activity]);

  // use effect with empty dependency array only runs once - on mount.
  // return statement runs on unmount
  useEffect(() => {
    // setup activity listeners ONLY on initial page load
    setupActivityListeners();
    fetchTeamAndChannelData();

    // handle unmount, remove listeners
    return removeActivityListeners;
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
        logout={() => {
          setActivity(UserActivity.Offline);
          activitySubmit(UserActivity.Offline);
        }}
      />
      <ChatArea isUserAdmin={Boolean(userState.user?.isAdmin)} />
    </Box>
  );
}

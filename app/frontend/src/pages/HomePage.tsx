import { Box, useMediaQuery, useTheme } from "@mui/material";

import Cookies from "js-cookie";
import { useEffect, useRef, useState } from "react";
import SideBar from "../components/Sidebar/SideBar";
import { ITeamModel, IUserModel, UserActivity } from "../models/models";

import { useNavigate } from "react-router-dom";
import wretch from "wretch";
import ChatArea from "../components/Chat/ChatArea";
import { useApplicationStore } from "../stores/ApplicationStore";
import { useUserStore } from "../stores/UserStore";
import { API_URL } from "../utils/FetchUtils";

export default function HomePage() {
  const theme = useTheme();
  const isBrowser = useMediaQuery(theme.breakpoints.up("sm"));

  // stores for state management
  const applicationState = useApplicationStore();
  const userState = useUserStore();

  const navigate = useNavigate();
  const [activity, setActivity] = useState<string>(UserActivity.Online);
  const lastUpdate = useRef<Date | undefined>(undefined);
  const setupActivityListeners = () => {
    document.addEventListener("keydown", activitySubmitOnline);
    document.addEventListener("click", activitySubmitOnline);
  };

  const removeActivityListeners = () => {
    document.removeEventListener("keydown", activitySubmitOnline);
    document.removeEventListener("click", activitySubmitOnline);
  };

  const activitySubmitOnline = () => {
    activitySubmit(UserActivity.Online);
  };

  const activitySubmit = (status: string) => {
    if (
      !(activity === "Online" && status === "Offline") &&
      Date.now() -
        (lastUpdate.current
          ? lastUpdate.current.getTime()
          : Date.now() - 10000) <
        1000
    )
      return;
    setActivity(status);
    lastUpdate.current = new Date(Date.now());
    wretch(`${API_URL}/api/home/activity`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .post({ Activity: status })
      .res(() => {
        if (status == "Offline") {
          window.location.reload();
          setTimeout(() => {
            Cookies.remove("isLoggedIn");
            localStorage.removeItem("jwt-token");
            userState.setIsLoggedIn(false);
            navigate("/login");
          }, 100);
        }
      })
      .catch((error) => {
        console.error("Error submitting activity:", error);
      });
  };
  // use effect with empty dependency array only runs once - on mount.
  useEffect(() => {
    setupActivityListeners();
    fetchTeamAndChannelData();

    // runs on component unmount
    return () => {
      removeActivityListeners();
    };
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

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
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
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
      />
      <ChatArea
        isUserAdmin={Boolean(userState.user?.isAdmin)}
        toggleSidebar={handleDrawerToggle}
      />{" "}
    </Box>
  );
}

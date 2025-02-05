import { Container, Button, useMediaQuery, useTheme } from "@mui/material";

import { useContext, useState } from "react";
import Cookies from "js-cookie";
import SideBar from "./SideBar";
import { ITeamModel } from "../models/models";

export default function HomePage() {
  const theme = useTheme();
  const isBrowser = useMediaQuery(theme.breakpoints.up("sm"));

  const [teams, setTeams] = useState<ITeamModel[]>([]);

  const [tempTeamCount, setTempTeamCount] = useState<number>(1000);

  const temporaryPopulateTeams = () => {
    setTeams((previous) =>
      previous.concat([
        { team_id: tempTeamCount, team_name: "some team name" },
        { team_id: tempTeamCount + 1, team_name: "some team name" },
        { team_id: tempTeamCount + 2, team_name: "some team name" },
      ]),
    );
    setTempTeamCount((previous) => previous + 3);
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
  const logOut = () => {
    Cookies.remove("isLoggedIn");
    localStorage.removeItem("jwt-token");
    window.location.href = "http://localhost:5173"; // modify this later probably
  };

  const drawerVariant = isBrowser ? "permanent" : "temporary";

  return (
    <div style={{ display: "flex" }}>
      <SideBar
        teams={teams}
        drawerVariant={drawerVariant}
        drawerOpen={drawerOpen}
        handleDrawerToggle={handleDrawerToggle}
      />
      <main style={{ flexGrow: 1, padding: "16px", marginTop: "64px" }}>
        <Container maxWidth="sm">
          You are logged in!
          <Button variant="contained" onClick={authedApiTest}>
            Click me to test Auth API
          </Button>
          <Button variant="contained" onClick={temporaryPopulateTeams}>
            Click to populate the teams bar
          </Button>
          <Button variant="contained" onClick={logOut}>
            Log me out pls
          </Button>
        </Container>
      </main>
    </div>
  );
}

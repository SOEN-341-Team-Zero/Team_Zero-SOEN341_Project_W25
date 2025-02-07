import {
  Button,
  useMediaQuery,
  useTheme,
  Box,
  Typography,
  Grid2 as Grid,
} from "@mui/material";

import { useEffect, useState } from "react";
import SideBar from "./SideBar";
import { IChannelModel, ITeamModel, IUserModel } from "../models/models";

import wretch from "wretch";

export default function HomePage() {
  const theme = useTheme();
  const isBrowser = useMediaQuery(theme.breakpoints.up("sm"));

  const [teams, setTeams] = useState<ITeamModel[]>([]);
  const [channels, setChannels] = useState<IChannelModel[]>([]);

  const [selectedTeam, setSelectedTeam] = useState<ITeamModel>(); // TODO add store (zustand/redux)
  const [selectedChannel, setSelectedChannel] = useState<IChannelModel>(); // TODO add store (zustand/redux)

  const [tempTeamCount, setTempTeamCount] = useState<number>(1000);
  const [tempChannelsCount, setTempChannelsCount] = useState<number>(2000);

  // retrieves data on home page load for the first time
  useEffect(() => {
    fetchTeamAndChannelData();
  }, []);

  const fetchTeamAndChannelData = () => {
    wretch(`http://localhost:3001/api/home/index`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .get()
      .json((res: { users: IUserModel[]; teams: ITeamModel[] }) =>
        loadData(res),
      )
      .catch((err) => console.error(err));
  };

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

  const temporaryPopulateChannels = () => {
    setChannels((previous) =>
      previous.concat([
        {
          team_id: selectedTeam?.team_id ?? -1, // -1 scenario should never happen anyway and it's just for testing
          channel_name: "some channel name",
          id: tempChannelsCount,
        },
        {
          team_id: selectedTeam?.team_id ?? -1,
          channel_name: "some other channel name",
          id: tempChannelsCount + 1,
        },
        {
          team_id: selectedTeam?.team_id ?? -1,
          channel_name: "some other other channel name",
          id: tempChannelsCount + 2,
        },
      ]),
    );
    setTempChannelsCount((previous) => previous + 3);
  };

  const loadData = (data: { users: IUserModel[]; teams: ITeamModel[] }) => {
    const teamsData = data.teams.map((team: any) => ({
      team_id: team.team_id,
      team_name: team.team_name,
    }));

    const channelsData = data.teams.flatMap((team: any) =>
      team.channels.map((channel: any) => ({
        ...channel,
        team_id: team.team_id,
      })),
    );

    setTeams(teamsData);
    setChannels(channelsData);
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
        teams={teams}
        channels={channels}
        selectedTeam={selectedTeam}
        selectedChannel={selectedChannel}
        setSelectedChannel={setSelectedChannel}
        setSelectedTeam={setSelectedTeam}
        drawerVariant={drawerVariant}
        drawerOpen={drawerOpen}
        handleDrawerToggle={handleDrawerToggle}
        refetchData={fetchTeamAndChannelData}
      />
      <main
        style={{
          alignContent: "center",
          flexGrow: 1,
          padding: "16px",
          margin: "6px",
          backgroundColor: "#18181880",
          borderRadius: "4px",
        }}
      >
        <Grid container justifyContent={"center"} spacing={2}>
          <Typography variant={"h2"}>You are logged in!</Typography>
          <Grid container size={12} spacing={2} justifyContent={"center"}>
            <Button variant="contained" onClick={authedApiTest}>
              Click me to test Auth API
            </Button>
            <Button variant="contained" onClick={temporaryPopulateTeams}>
              Click to populate the teams bar
            </Button>
            {selectedTeam && (
              <Button variant="contained" onClick={temporaryPopulateChannels}>
                Click to populate the currently selected channel
              </Button>
            )}
          </Grid>
          <Grid>
            <Typography variant={"body1"}>
              messages will go here... someday... soon probably
            </Typography>
          </Grid>
        </Grid>
      </main>
    </Box>
  );
}

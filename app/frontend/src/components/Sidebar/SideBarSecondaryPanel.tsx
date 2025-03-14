import {
  Box,
  Divider,
  Grid2 as Grid,
  List,
  Button
} from "@mui/material";
import { IChannelModel, IDMChannelModel } from "../../models/models";
import { useState } from "react";
import { useApplicationStore, ViewModes } from "../../stores/ApplicationStore";
import { useUserStore } from "../../stores/UserStore";
import CreateChannelButton from "../Buttons/CreateChannelButton";
import CreateDMButton from "../Buttons/CreateDMButton";
import InviteToTeamButton from "../Buttons/InviteToTeamButton";
import TeamUserListHover from "../TeamUserListHover";
import ChannelListItem from "./ChannelListItem";
import ChatListItem from "./ChatListItem";

export default function SideBarSecondaryPanel() {
  const applicationState = useApplicationStore();
  const userState = useUserStore();
  const [displayPrivate, setDisplayPrivate] = useState<boolean>(true);
  const [displayPublic, setDisplayPublic] = useState<boolean>(true);

  return (
    <Grid
      className={"sidebar-secondary-panel panel"}
      size={8.6}
      justifyItems={"left"}
      container
      direction={"column"}
      overflow={"hidden"}
    >
      {applicationState.viewMode === ViewModes.Team && applicationState.selectedTeam && (
        <TeamUserListHover team={applicationState.selectedTeam}/>
      )}
      {applicationState.viewMode === ViewModes.DirectMessage && (
        <Box
          className={"create-chat-button"}
          alignContent={"center"}
          justifyItems="center"
        >
          <CreateDMButton />
        </Box>
      )}

      <Divider variant="middle" />
      {applicationState.viewMode === ViewModes.Team && (applicationState.selectedTeam?.team_id ?? -1) >= 0 && (
  <List
    sx={{
      maxWidth: "100%",
      height: (userState.isUserAdmin)
        ? "calc(100vh - 160px)"
        : "calc(100vh - 94px)",
      overflowY: "scroll",
      scrollbarWidth: "none", // firefox
      "&::-webkit-scrollbar": {
        display: "none", // chrome, safari, opera
      },
    }}
  >
    {/* Private Channels */}
    {applicationState.channels.some(c => !c.pub) && (
      <>
        <Button onClick={() => setDisplayPrivate(!displayPrivate)}>
          Private {displayPrivate ? "∨" : "›"}
        </Button>
        {applicationState.channels
          .filter(c => !c.pub)
          .map((channel: IChannelModel) => 
            channel.team_id === applicationState.selectedTeam?.team_id && (
              <span key={channel.id} style={{ display: displayPrivate ? "block" : "none" }}>
                <ChannelListItem isUserAdmin={userState.isUserAdmin} channel={channel} />
              </span>
            )
          )}
      </>
    )}

    {/* Public Channels */}
    {applicationState.channels.some(c => c.pub) && (
        <span style={{ display: "block" }}><Button onClick={() => setDisplayPublic(!displayPublic)}>
          Public {displayPublic ? "∨" : "›"}
        </Button>
        {applicationState.channels
          .filter(c => c.pub)
          .map((channel: IChannelModel) => 
            channel.team_id === applicationState.selectedTeam?.team_id && (
              <span key={channel.id} style={{ display: displayPublic ? "block" : "none" }}>
                <ChannelListItem isUserAdmin={userState.isUserAdmin} channel={channel} />
              </span>
            )
          )}</span>
    )}
  </List>
)}

      {applicationState.viewMode === ViewModes.DirectMessage && (
        <List
          sx={{
            maxWidth: "100%",
            height: "calc(100vh - 96px)",
            overflowY: "scroll",
            scrollbarWidth: "none", // firefox
            "&::-webkit-scrollbar": {
              display: "none", // chrome, safari, opera
            },
          }}
        >
          {applicationState.dmChannels.map(
            //render dms
            (dmChannel: IDMChannelModel) => (
              <ChatListItem key={dmChannel.dm_id} dmChannel={dmChannel} />
            ),
          )}
        </List>
      )}

      <Divider variant="middle" />
      <Grid
            className={"team-actions"}
            container
            p="8px"
            width={"100%"}
            spacing={1}
            justifyContent="space-between"
          >
            {applicationState.viewMode === ViewModes.Team &&
        applicationState.selectedTeam &&
        (userState.isUserAdmin) && (
            <CreateChannelButton
              teamId={applicationState.selectedTeam?.team_id ?? -1}
            />
          
          )}
          {applicationState.viewMode === ViewModes.Team &&
        applicationState.selectedTeam && userState.isUserAdmin && (
            <InviteToTeamButton
              teamId={applicationState.selectedTeam?.team_id ?? -1}
              teamName={applicationState.selectedTeam?.team_name ?? "this team"}
            />)}
          
    </Grid>
        
  </Grid>
  );
}

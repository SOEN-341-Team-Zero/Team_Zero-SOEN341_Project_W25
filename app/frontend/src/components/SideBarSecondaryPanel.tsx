import {
  Grid2 as Grid,
  Box,
  Typography,
  Divider,
  List,
  Button,
} from "@mui/material";
import { IChannelModel, IDMChannelModel } from "../models/models";
import ChannelListItem from "./ChannelListItem";
import CreateChannelButton from "./CreateChannelButton";
import InviteToTeamButton from "./InviteToTeamButton";
import { useApplicationStore, ViewModes } from "../stores/ApplicationStore";
import { useUserStore } from "../stores/UserStore";
import ChatListItem from "./ChatListItem";
import CreateChatButton from "./CreateChatButton";

export default function SideBarSecondaryPanel() {
  const applicationState = useApplicationStore();
  const userState = useUserStore();

  return (
    <Grid
      className={"sidebar-secondary-panel panel"}
      size={8.6}
      justifyItems={"left"}
      container
      direction={"column"}
      overflow={"hidden"}
      justifyContent={"space-between"}
    >
      {applicationState.viewMode === ViewModes.Team && (
        <Box
          className={"selected-team-title"}
          alignContent={"center"}
          justifyItems="center"
        >
          <Typography noWrap>
            {applicationState.selectedTeam?.team_name}
          </Typography>
        </Box>
      )}
      {applicationState.viewMode === ViewModes.DirectMessage && (
        <Box
          className={"create-chat-button"}
          alignContent={"center"}
          justifyItems="center"
        >
          <CreateChatButton />
        </Box>
      )}

      <Divider variant="middle" />
      {applicationState.viewMode === ViewModes.Team && (
        <List
          sx={{
            maxWidth: "100%",
            height: userState.isUserAdmin
              ? "calc(100vh - 160px)"
              : "calc(100vh - 94px)",
            overflowY: "scroll",
            scrollbarWidth: "none", // firefox
            "&::-webkit-scrollbar": {
              display: "none", // chrome, safari, opera
            },
          }}
        >
          {applicationState.channels.map(
            // render channels
            (channel: IChannelModel) =>
              channel.team_id === applicationState.selectedTeam?.team_id && (
                <ChannelListItem
                  key={channel.id}
                  isUserAdmin={userState.isUserAdmin}
                  channel={channel}
                />
              ),
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

      {applicationState.viewMode === ViewModes.Team &&
        applicationState.selectedTeam &&
        userState.isUserAdmin && (
          <Grid
            className={"team-actions"}
            container
            p="8px"
            justifyContent="space-between"
            width={"100%"}
            spacing={1}
          >
            <CreateChannelButton
              teamId={applicationState.selectedTeam?.team_id ?? -1}
            />

            <InviteToTeamButton
              teamId={applicationState.selectedTeam?.team_id ?? -1}
              teamName={applicationState.selectedTeam?.team_name ?? "this team"}
            />
          </Grid>
        )}
    </Grid>
  );
}

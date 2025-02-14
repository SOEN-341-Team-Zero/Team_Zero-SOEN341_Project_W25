import { Grid2 as Grid, Box, Typography, Divider, List } from "@mui/material";
import { IChannelModel, IChatModel } from "../models/models";
import ChannelListItem from "./ChannelListItem";
import CreateChannelButton from "./CreateChannelButton";
import InviteToTeamButton from "./InviteToTeamButton";
import { useApplicationStore, ViewModes } from "../stores/ApplicationStore";
import { useUserStore } from "../stores/UserStore";
import ChatListItem from "./ChatListItem";

export default function SideBarSecondaryPanel() {
  const applicationState = useApplicationStore();
  const userState = useUserStore();

  return (
    <Grid
      className={"channel-bar panel"}
      size={8.6}
      justifyItems={"left"}
      container
      direction={"column"}
      overflow={"hidden"}
      justifyContent={"space-between"}
    >
      <Box
        className={"selected-team-title"}
        alignContent={"center"}
        justifyItems="center"
      >
        <Typography noWrap>
          {applicationState.selectedTeam?.team_name}
        </Typography>
      </Box>
      <Divider variant="middle" />

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
        {applicationState.viewMode === ViewModes.Channel &&
          applicationState.channels.map(
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

        {applicationState.viewMode === ViewModes.DirectMessage &&
          applicationState.chats.map(
            //render chats
            (chat: IChatModel) => <ChatListItem chat={chat} />,
          )}
      </List>

      <Divider variant="middle" />

      {applicationState.viewMode === ViewModes.Channel &&
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

import { Divider, List, Button, Grid2 as Grid } from "@mui/material";
import { IChannelModel, ITeamModel } from "../../models/models";
import { useApplicationStore } from "../../stores/ApplicationStore";
import TeamUserListHover from "../TeamUserListHover";
import ChannelListItem from "./ChannelListItem";
import { useUserStore } from "../../stores/UserStore";
import { useState } from "react";
import CreateChannelButton from "../Buttons/CreateChannelButton";
import InviteToTeamButton from "../Buttons/InviteToTeamButton";

export default function TeamSidebarContent() {
  const applicationState = useApplicationStore();
  const userState = useUserStore();
  const [displayPrivate, setDisplayPrivate] = useState<boolean>(true);
  const [displayPublic, setDisplayPublic] = useState<boolean>(true);

  return (
    <>
      {applicationState.selectedTeam && (
        <>
          <TeamUserListHover team={applicationState.selectedTeam} />
          <Divider variant="middle" />

          {(applicationState.selectedTeam?.team_id ?? -1) >= 0 && (
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
              {/* Private Channels */}
              {applicationState.channels.some((c) => !c.pub) && (
                <>
                  <Button onClick={() => setDisplayPrivate(!displayPrivate)}>
                    Private {displayPrivate ? "∨" : "›"}
                  </Button>
                  {applicationState.channels
                    .filter((c) => !c.pub)
                    .map(
                      (channel: IChannelModel) =>
                        channel.team_id ===
                          applicationState.selectedTeam?.team_id && (
                          <span
                            key={channel.id}
                            style={{
                              display: displayPrivate ? "block" : "none",
                            }}
                          >
                            <ChannelListItem
                              isUserAdmin={userState.isUserAdmin}
                              channel={channel}
                            />
                          </span>
                        ),
                    )}
                </>
              )}

              {/* Public Channels */}
              {applicationState.channels.some((c) => c.pub) && (
                <span style={{ display: "block" }}>
                  <Button onClick={() => setDisplayPublic(!displayPublic)}>
                    Public {displayPublic ? "∨" : "›"}
                  </Button>
                  {applicationState.channels
                    .filter((c) => c.pub)
                    .map(
                      (channel: IChannelModel) =>
                        channel.team_id ===
                          applicationState.selectedTeam?.team_id && (
                          <span
                            key={channel.id}
                            style={{
                              display: displayPublic ? "block" : "none",
                            }}
                          >
                            <ChannelListItem
                              isUserAdmin={userState.isUserAdmin}
                              channel={channel}
                            />
                          </span>
                        ),
                    )}
                </span>
              )}
            </List>
          )}
          {userState.isUserAdmin && (
            <>
              <Divider variant="middle" />
              <Grid
                className={"team-actions"}
                container
                p="8px"
                width={"100%"}
                spacing={1}
                justifyContent="space-between"
              >
                <CreateChannelButton
                  teamId={applicationState.selectedTeam?.team_id ?? -1}
                />

                <InviteToTeamButton
                  teamId={applicationState.selectedTeam?.team_id ?? -1}
                  teamName={
                    applicationState.selectedTeam?.team_name ?? "this team"
                  }
                />
              </Grid>
            </>
          )}
        </>
      )}
    </>
  );
}

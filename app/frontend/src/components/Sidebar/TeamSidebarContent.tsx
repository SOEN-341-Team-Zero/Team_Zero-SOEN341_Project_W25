import {
  Divider,
  List,
  Button,
  Grid2 as Grid,
  Typography,
} from "@mui/material";
import { IChannelModel, ITeamModel } from "../../models/models";
import { useApplicationStore } from "../../stores/ApplicationStore";
import TeamUserListHover from "../TeamUserListHover";
import ChannelListItem from "./ChannelListItem";
import { useUserStore } from "../../stores/UserStore";
import { useState } from "react";
import CreateChannelButton from "../Buttons/CreateChannelButton";
import InviteToTeamButton from "../Buttons/InviteToTeamButton";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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
              {/* Public Channels */}
              {applicationState.channels.some((c) => c.is_public) && (
                <span style={{ display: "block", padding: "10px 0px" }}>
                  <Button
                    variant={"outlined"}
                    sx={{
                      width: "95%",
                      backgroundColor: "rgba(34, 34, 34, 0.5)",
                    }}
                    onClick={() => setDisplayPublic(!displayPublic)}
                  >
                    Public{" "}
                    {displayPublic ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                  </Button>
                  {applicationState.channels
                    .filter((c) => c.is_public)
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

              {/* Private Channels */}
              {applicationState.channels.some((c) => !c.is_public) && (
                <>
                  <Button
                    disableFocusRipple
                    variant={"outlined"}
                    sx={{
                      width: "95%",
                      backgroundColor: "rgba(34, 34, 34, 0.5)",
                    }}
                    onClick={() => setDisplayPrivate(!displayPrivate)}
                  >
                    Private
                    {displayPrivate ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                  </Button>
                  {applicationState.channels
                    .filter((c) => !c.is_public)
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

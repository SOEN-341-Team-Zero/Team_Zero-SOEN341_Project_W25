import {
  Box,
  Divider,
  Grid2 as Grid,
  Typography
} from "@mui/material";
import { IChannelModel } from "../../models/models";
import "../../styles/ChatArea.css";
import ChannelUserListHover from "../ChannelUserListHover";
interface ChatAreaChannelHeaderProps {
  currentChannel: IChannelModel | null;
  teamId: number | null;
}

export default function ChatTeamsChannelHeader(
  props: ChatAreaChannelHeaderProps
) {
  return (
    <Grid
      container
      className={"channel-title-bar"}
      style={{ display: "flex", alignItems: "center" }}
    >
      {!!props.currentChannel && (
        <Grid
          size={{ xs: 8 }}
          style={{ display: "flex", alignItems: "center" }}
        >
          <Typography
            style={{
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              flexShrink: 0,
            }}
          >
            {props.currentChannel?.channel_name}
          </Typography>
        </Grid>
      )}
      {!!props.currentChannel && (
        <Grid
          size={{ xs: 4 }}
          display={{ xs: "flex" }}
          container
          justifyContent={"flex-end"}
        >
          <ChannelUserListHover channel={props.currentChannel}/>
        </Grid>
      )}
    </Grid>
  );
}

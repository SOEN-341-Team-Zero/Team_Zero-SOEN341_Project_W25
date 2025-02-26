import {
  Grid2 as Grid,
  Typography,
  Divider,
  AvatarGroup,
  Avatar,
  Box,
} from "@mui/material";
import { IChannelModel } from "../../models/models";
import "../../styles/ChatArea.css";
import { stringAvatar } from "../../utils/AvatarUtils";
interface ChatAreaChannelHeaderProps {
  currentChannel: IChannelModel | null;
}

export default function ChatTeamsChannelHeader(
  props: ChatAreaChannelHeaderProps,
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
          <Box display={{ xs: "none", md: "flex" }}>
            <Divider
              orientation="vertical"
              flexItem
              style={{ margin: "0 8px" }}
            />
            <Typography
              color="secondary"
              style={{
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                flexShrink: 1,
              }}
            >
              {"yippity yappity here's a temporary description"}
            </Typography>
          </Box>
        </Grid>
      )}
      {!!props.currentChannel && (
        <Grid
          size={{ xs: 4 }}
          display={{ xs: "flex" }}
          container
          justifyContent={"flex-end"}
        >
          <AvatarGroup max={5}>
            <Avatar {...stringAvatar("apppity ap apple")} />
            <Avatar {...stringAvatar("boom bap")} />
            <Avatar {...stringAvatar("chocolate cat")} />
          </AvatarGroup>
        </Grid>
      )}
    </Grid>
  );
}

import { Avatar, Grid2 as Grid, Typography, Box } from "@mui/material";
import { IDMChannelModel, UserActivity } from "../../models/models";
import "../../styles/ChatArea.css";
import { stringAvatar } from "../../utils/AvatarUtils";
import ActivityBadge from "../ActivityBadge";

interface ChatAreaDMHeaderProps {
  currentDMChannel: IDMChannelModel | null;
}

export default function ChatAreaDMHeader(props: ChatAreaDMHeaderProps) {
  const title = props.currentDMChannel?.otherUser?.username ?? "";

  return (
    <Grid
      container
      className={"channel-title-bar"}
      style={{ display: "flex", alignItems: "center" }}
    >
      {!!props.currentDMChannel && (
        <Grid
          size={{ xs: 12 }}
          style={{ display: "flex", alignItems: "center" }}
          spacing={2}
          container
        >
          <ActivityBadge
            activity={
              (props.currentDMChannel.otherUser.activity as UserActivity) ??
              "Offline"
            }
          >
            <Avatar
              {...stringAvatar(title, { width: "36px", height: "36px" })}
            />
          </ActivityBadge>
          <Typography
            style={{
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              flexShrink: 0,
            }}
          >
            {title}
          </Typography>
        </Grid>
      )}
    </Grid>
  );
}

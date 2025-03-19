import { Avatar, Grid2 as Grid, Typography, Box } from "@mui/material";
import { IDMChannelModel } from "../../models/models";
import "../../styles/ChatArea.css";
import { stringAvatar } from "../../utils/AvatarUtils";

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
          <Avatar {...stringAvatar(title, { width: "36px", height: "36px" })} />
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor:
                (props.currentDMChannel?.otherUser?.activity ?? "Offline") ===
                "Online"
                  ? "green"
                  : (props.currentDMChannel?.otherUser?.activity ??
                        "Offline") == "Away"
                    ? "orange"
                    : "gray",
              border: "2px solid black",
            }}
          />
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

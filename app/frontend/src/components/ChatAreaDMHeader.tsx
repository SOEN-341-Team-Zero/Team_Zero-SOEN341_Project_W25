import {
  Avatar,
  AvatarGroup,
  Box,
  Divider,
  Grid2 as Grid,
  Typography,
} from "@mui/material";
import { IChatModel } from "../models/models";
import "../styles/ChatArea.css";
import { stringAvatar } from "../utils/AvatarUtils";
import { getChatDisplayName } from "../utils/ChatTitleUtils";
import { useUserStore } from "../stores/UserStore";

interface ChatAreaDMHeaderProps {
  currentChat: IChatModel | null;
}

export default function ChatAreaDMHeader(props: ChatAreaDMHeaderProps) {
  const currentUserName = useUserStore((state) => state.user?.username);
  const title = getChatDisplayName(props.currentChat, currentUserName);

  return (
    <Grid
      container
      className={"channel-title-bar"}
      style={{ display: "flex", alignItems: "center" }}
    >
      {/* {!!props.currentChat && ( */}
      <Grid
        size={{ xs: 12 }}
        style={{ display: "flex", alignItems: "center" }}
        spacing={2}
        container
      >
        <Avatar {...stringAvatar(title, { width: "36px", height: "36px" })} />
        <Typography
          style={{
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            flexShrink: 0,
          }}
        >
          {title + "testestests"}
        </Typography>
      </Grid>
      {/* )} */}
    </Grid>
  );
}

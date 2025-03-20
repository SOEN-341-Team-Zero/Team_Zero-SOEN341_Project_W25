import { Avatar, Box, Typography } from "@mui/material";
import { IChannelMessageModel, UserActivity } from "../../models/models";
import { stringAvatar } from "../../utils/AvatarUtils";
import ActivityBadge from "../ActivityBadge";

interface ChatMessageProps {
  message: IChannelMessageModel;
  id: number;
  userId: number;
}

export default function ChatMessage(props: ChatMessageProps) {
  const isMessageFromCurrentUser = props.message.senderId === props.userId;

  return (
    <Box
      display={"flex"}
      flexDirection={isMessageFromCurrentUser ? "row-reverse" : "row"}
      sx={{ gap: "12px", marginBottom: "12px" }}
    >
      <Box display={"block"} pt="4px">
        <ActivityBadge activity={UserActivity.Online} disableAnimation>
          <Avatar {...stringAvatar(props.message.username)} />
        </ActivityBadge>
      </Box>
      <Box
        sx={{
          textAlign: isMessageFromCurrentUser ? "right" : "left",
          justifyItems: isMessageFromCurrentUser ? "flex-end" : "flex-start",
        }}
      >
        <Typography>{props.message.username}</Typography>
        <Box
          sx={{
            width: "fit-content",
            padding: "4px 16px",
            borderRadius: "4px",
            textAlign: "left",
            backgroundColor: isMessageFromCurrentUser ? "#669266" : "#D7E4D3",
            color: isMessageFromCurrentUser ? "#FFFFFF" : "#000000",
            maxWidth: "100%",
            wordBreak: "break-word",
          }}
        >
          <span>{props.message.message}</span>
        </Box>
      </Box>
    </Box>
  );
}

import { Avatar, Box, Typography, Tooltip } from "@mui/material";
import { IChannelMessageModel } from "../../models/models";
import { stringAvatar } from "../../utils/AvatarUtils";

interface ChatMessageProps {
  message: IChannelMessageModel;
  id: number;
  userId: number;
  userActivity: string;
}

export default function ChatMessage(props: ChatMessageProps) {
  const isMessageFromCurrentUser = props.message.senderId === props.userId;

  return (
    <Box
      display={"flex"}
      flexDirection={isMessageFromCurrentUser ? "row-reverse" : "row"}
      sx={{ gap: "12px", marginBottom: "12px" }}
    >
      <Box pt="4px">
        <Avatar {...stringAvatar(props.message.username)} />
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor:
              props.userActivity == "Online"
                ? "green"
                : props.userActivity == "Away"
                  ? "orange"
                  : "gray",
            border: "2px solid black",
          }}
        />
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

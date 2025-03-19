import { Avatar, Box, Typography, IconButton } from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import { IChannelMessageModel } from "../../models/models";
import { stringAvatar } from "../../utils/AvatarUtils";

enum Activity {
  Online = "Online",
  Away = "Away",
  Offline = "Offline"
}

interface ChatMessageProps {
  message: IChannelMessageModel;
  id: number;
  userId: number;
  userActivity: Activity;
  onReply: (messageId: number) => void;
}

export default function ChatMessage(props: ChatMessageProps) {
  const isMessageFromCurrentUser = props.message.senderId === props.userId;
  return (
    <Box
      display={"flex"}
      flexDirection={isMessageFromCurrentUser ? "row-reverse" : "row"}
      sx={{ gap: "12px", marginBottom: "12px", position: "relative" }}
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
            backgroundColor: props.userActivity == Activity.Online ? "green" : (props.userActivity == Activity.Away ? "orange" : "gray"),
            border: "2px solid black"
          }}
        />
      </Box>
      <Box
        sx={{
          textAlign: isMessageFromCurrentUser ? "right" : "left",
          justifyItems: isMessageFromCurrentUser ? "flex-end" : "flex-start",
          position: "relative",
          width: "100%"
        }}
      >
        <Typography>{props.message.username}</Typography>
        
        {props.message.replyToId !== undefined && 
        props.message.replyToUsername && 
        props.message.replyToMessage && (
          <Box
            sx={{
              padding: "2px 8px",
              borderRadius: "4px",
              backgroundColor: "#4a644a",
              borderLeft: "3px solidrgba(83, 172, 117, 0.94)",
              marginBottom: "4px",
              fontSize: "0.85rem",
              maxWidth: "100%",
              opacity: 0.8
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: "bold" }}>
              @{props.message.replyToUsername}
            </Typography>
            <Typography variant="body2" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {props.message.replyToMessage}
            </Typography>
          </Box>
        )}
        
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
        
        <IconButton 
          size="small" 
          onClick={() => props.onReply(props.id)}
          sx={{ 
            position: "absolute", 
            right: isMessageFromCurrentUser ? "auto" : "0", 
            left: isMessageFromCurrentUser ? "0" : "auto",
            top: "50%",
            transform: "translateY(-50%)",
            opacity: 0,
            "&:hover": { opacity: 1 },
            ".message-container:hover &": { opacity: 0.7 }
          }}
        >
          <ReplyIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
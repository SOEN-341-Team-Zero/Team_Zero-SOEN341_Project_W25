import { Avatar, Box, Typography, IconButton } from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import { IChannelMessageModel } from "../../models/models";
import { stringAvatar } from "../../utils/AvatarUtils";
import ReactionButton from "./ReactionButton";
import { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { useApplicationStore, ViewModes } from "../../stores/ApplicationStore";

interface ChatMessageProps {
  message: IChannelMessageModel;
  id: number;
  userId: number;
  onReply: (messageId: number) => void;
  emojiReactions: string[];
  userEmojiReactions: string[];
  onReact: (emoji: string, increase: boolean) => void;
}

export default function ChatMessage(props: ChatMessageProps) {
  const applicationState = useApplicationStore();
  const isMessageFromCurrentUser = props.message.senderId === props.userId;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const handleEmojiSelect = (emojiObject: { emoji: string }) => {
    props.onReact(emojiObject.emoji, !props.userEmojiReactions.includes(emojiObject.emoji));
    setShowEmojiPicker(false);
  };
  if(showEmojiPicker) document.addEventListener("click", () => setShowEmojiPicker(false));

  return (
    <Box
      display={"flex"}
      flexDirection={isMessageFromCurrentUser ? "row-reverse" : "row"}
      sx={{ gap: "12px", marginBottom: "12px", position: "relative" }}
    >
      <Box display={"block"} pt="4px">
        <Avatar {...stringAvatar(props.message.username)} />
      </Box>
      <Box
        sx={{
          textAlign: isMessageFromCurrentUser ? "right" : "left",
          justifyItems: isMessageFromCurrentUser ? "flex-end" : "flex-start",
          position: "relative",
          width: "100%",
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
                opacity: 0.8,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                {typeof props.message.replyToUsername === "number"
                  ? `@${props.message.replyToMessage}`
                  : `@${props.message.replyToUsername}`}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {props.message.replyToMessage}
              </Typography>
            </Box>
          )}

        <Box
          display="flex"
          flexDirection={isMessageFromCurrentUser ? "row-reverse" : "row"}
          alignItems="center"
        >
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
          <Box position="relative">
            {applicationState.viewMode === ViewModes.Team &&
            <IconButton
              size="small"
              onClick={e => {setShowEmojiPicker(!showEmojiPicker); e.stopPropagation();}}
              sx={{
                opacity: 0,
                "&:hover": { opacity: 1 },
                ".message-container:hover &": { opacity: 0.7 },
              }}
            >
              <InsertEmoticonIcon fontSize="small" />
            </IconButton>}

            {showEmojiPicker && (
              <Box
                position="fixed"
                bottom="50px"
                left="50%"
                sx={{ transform: "translateX(-50%)", zIndex: 1300 }}
                onClick={e => e.stopPropagation()}
              >
                <EmojiPicker onEmojiClick={handleEmojiSelect}/>
              </Box>
            )}
          </Box>
          <IconButton
            size="small"
            onClick={() => props.onReply(props.id)}
            sx={{
              opacity: 0,
              "&:hover": { opacity: 1 },
              ".message-container:hover &": { opacity: 0.7 },
            }}
          >
            <ReplyIcon fontSize="small" />
          </IconButton>
        </Box>
    {props.emojiReactions.length > 0 && (
      <Box sx={{
        display: "flex",
        flexWrap: "wrap",
        flexDirection: isMessageFromCurrentUser ? "row-reverse" : "row",
        justifyContent: "flex-start"
      }}>
        {Object.entries(
          props.emojiReactions.reduce((acc: Record<string, number>, emoji) => {
            acc[emoji] = (acc[emoji] || 0) + 1;
            return acc;
          }, {})
        )
          .sort(([, countA], [, countB]) => countB - countA)
          .map(([emoji, count]) => (
            <ReactionButton
              key={emoji}
              numReactions={count}
              emoji={emoji}
              userSelected={props.userEmojiReactions.includes(emoji)}
              onReact={() => props.onReact(emoji, !props.userEmojiReactions.includes(emoji))}
            />
          ))}
      </Box>
    )}
      </Box>
    </Box>
  );
}

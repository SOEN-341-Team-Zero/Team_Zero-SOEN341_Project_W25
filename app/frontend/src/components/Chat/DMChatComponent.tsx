import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Grid2 as Grid,
  IconButton,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import wretch from "wretch";
import abort from "wretch/addons/abort";
import { IChannelMessageModel, UserActivity } from "../../models/models";
import DMChatService from "../../services/DMChatService";
import "../../styles/ChatArea.css";
import { API_URL } from "../../utils/FetchUtils";
import ChatMessage from "./ChatMessage";
import { useApplicationStore } from "../../stores/ApplicationStore";
import { activitySubmit } from "../../utils/ActivityUtils";
import { isMobile } from "../../utils/BrowserUtils";

interface DMChatComponentProps {
  dmId: number;
  userId: number;
  userName: string;
}

export default function DMChatComponent(props: DMChatComponentProps) {
  const [messages, setMessages] = useState<IChannelMessageModel[]>([]);
  const [message, setMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const chatbarRef = useRef<HTMLInputElement>(null);
  const [chatbarHeight, setChatbarHeight] = useState<number>(
    chatbarRef.current ? chatbarRef.current.getBoundingClientRect().height : 55,
  );
  const applicationState = useApplicationStore();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!props.dmId) return; // avoid starting connections/fetching dms if the dm isn't selected

    const startConnection = async () => {
      await DMChatService.startConnection(props.dmId);
    };

    startConnection();
    fetchMessages();

    const messageHandler = (
      senderId: number,
      username: string,
      message: string,
      dmId: number,
      sentAt: string,
      replyToId?: number,
      replyToUsername?: string,
      replyToMessage?: string,
    ) => {
      console.log("Live message received:", {
        senderId,
        username,
        message,
        dmId,
        sentAt,
        replyToId,
        replyToUsername,
        replyToMessage,
      });
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          senderId,
          username,
          message,
          sentAt,
          replyToId,
          replyToUsername,
          replyToMessage,
        },
      ]);
    };

    DMChatService.onMessageReceived(messageHandler);
    setMessages([]); // clear messages on dm change
    setReplyingTo(null); // clear reply status on dm change
  }, [props.dmId]);

  useEffect(() => {
    if (chatbarRef?.current) {
      setChatbarHeight(chatbarRef.current.getBoundingClientRect().height);
    }
  }, [message]);

  const previousRequestRef = useRef<any>(null);
  const fetchMessages = async () => {
    setLoading(true);
    const request = wretch(`${API_URL}/api/chat/dm?dm_id=${props.dmId}`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .get();

    previousRequestRef.current = request;
    try {
      const data: any = await request.json();
      if (previousRequestRef.current === request) {
        const messages = data.messages;
        const formattedMessages = messages.map((msg: any) => ({
          senderId: msg.sender_id,
          username:
            msg.sender_id === props.userId
              ? props.userName
              : applicationState.selectedDMChannel?.otherUser.username,
          message: msg.message_content,
          sentAt: msg.sent_at,
          replyToId: msg.reply_to_id || undefined,
          replyToUsername: msg.reply_to_username || undefined,
          replyToMessage: msg.reply_to_message || undefined,
        }));
        setMessages(formattedMessages);
      } else {
        //we abort the fetch if theres another fetch (fetch done later) request
        abort;
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Fetch error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    // get reply information if replying to a message
    let replyInfo = null;
    if (replyingTo !== null) {
      const repliedMessage = messages[replyingTo];
      if (repliedMessage) {
        console.log(messages[replyingTo]);
        replyInfo = {
          replyToId: replyingTo,
          replyToUsername: repliedMessage.username,
          replyToMessage: repliedMessage.message,
        };
        console.log("Replied message" + repliedMessage.message);
      }
    }
    console.log("Sending message with:", props.dmId, message, replyInfo);
    DMChatService.sendMessageToDM(props.dmId, message, replyInfo);
    setMessage("");
    setReplyingTo(null); // Clear reply after sending
    activitySubmit(UserActivity.Online);
  };

  const handleReply = (messageId: number) => {
    setReplyingTo(messageId);
    if (chatbarRef.current) {
      chatbarRef.current.focus();
    }
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const isUserMobile = isMobile();
  const containerHeightReduction =
    (chatbarRef.current ? 115 + chatbarHeight : 0) + (isUserMobile ? 60 : 0);

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
      }}
    >
      <Box className={"text-container"}>
        <Box
          className={"text-content"}
          sx={{
            maxHeight: "calc(100vh - " + containerHeightReduction + "px)",
            overflowY: loading ? "hidden" : "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#899483",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#3F4939",
            },
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            messages.map((message: IChannelMessageModel, index: number) => (
              <Box
                key={index}
                mb={"2px"}
                className="message-container"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  justifyContent: "space-between",
                  borderRadius: "4px",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexGrow: 1,
                    justifyContent:
                      message.senderId === props.userId
                        ? "flex-end"
                        : "flex-start",
                  }}
                >
                  <ChatMessage
                    key={index}
                    id={index}
                    message={message}
                    userId={props.userId}
                    onReply={handleReply}
                    emojiReactions={[]}
                    userEmojiReactions={[]}
                    onReact={() => {}}
                  />
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Box>

      {/* Reply indicator at the bottom (beside the input field)*/}
      {replyingTo !== null && messages[replyingTo] && (
        <Grid
          container
          alignItems="center"
          sx={{
            backgroundColor: "#4a644a",
            padding: "4px 8px",
            borderRadius: "4px 4px 0 0",
          }}
        >
          <Grid sx={{ flexGrow: 1 }}>
            <Typography variant="caption" component="div">
              Replying to <b>{messages[replyingTo].username}</b>:{" "}
              {messages[replyingTo].message.substring(0, 50)}
              {messages[replyingTo].message.length > 50 ? "..." : ""}
            </Typography>
          </Grid>
          <Grid>
            <IconButton size="small" onClick={cancelReply}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={1}>
        <Grid
          position={isUserMobile ? "fixed" : "relative"}
          maxWidth={isUserMobile ? "93.5%" : "100%"} // if only i were a good frontend dev right
          bottom={isUserMobile ? "16px" : "inherit"}
          container
          spacing={1}
          alignItems="center"
          className={"chat-bar-wrapper"}
          size={"grow"}
        >
          <Grid sx={{ flexGrow: 1 }}>
            <TextField
              disabled={loading}
              sx={{
                minHeight: "52px",
                border: "none",
                textWrap: "wrap",
                width: "100%",
                borderRadius: replyingTo !== null ? "0 0 4px 4px" : "4px",
              }}
              ref={chatbarRef}
              fullWidth
              multiline
              maxRows={5}
              autoComplete="off"
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(keyEvent) => {
                if (keyEvent.key === "Enter" && !keyEvent.shiftKey) {
                  keyEvent.preventDefault();
                  sendMessage();
                }
              }}
              value={message}
              placeholder={
                replyingTo !== null
                  ? "Reply to message..."
                  : "Type a message..."
              }
            />
          </Grid>
          <IconButton onClick={sendMessage}>
            <SendIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
}

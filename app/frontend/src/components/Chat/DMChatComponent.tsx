import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Grid2 as Grid, IconButton, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import wretch from "wretch";
import abort from "wretch/addons/abort";
import { IChannelMessageModel } from "../../models/models";
import DMChatService from "../../services/DMChatService";
import "../../styles/ChatArea.css";
import { API_URL } from "../../utils/FetchUtils";
import ChatMessage from "./ChatMessage";

enum Activity {
  Online = "Online",
  Away = "Away",
  Offline = "Offline"
}

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
      sentAt: string,
      replyToId?: number,
      replyToUsername?: string,
      replyToMessage?: string,
    ) => {
      console.log("Live message received:", {
        senderId,
        username,
        message,
        sentAt,
        replyToId,
        replyToUsername,
        replyToMessage
      });
      setMessages((prevMessages) => [
        ...prevMessages,
        { senderId, username, message, sentAt,replyToId, replyToUsername, replyToMessage },
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
    const request = wretch(`${API_URL}/api/chat/dm`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .get();

    previousRequestRef.current = request;
    try {
      const data: any = await request.json();
      if (previousRequestRef.current === request) {
        const currentDMChannel = data.dms.find(
          (dmChannel: any) => dmChannel.dm_id === props.dmId,
        );
        const formattedMessages = currentDMChannel.messages.map((msg: any) => ({
          senderId: msg.sender_id,
          username:
            msg.sender_id === props.userId
              ? props.userName
              : currentDMChannel.otherUser.username,
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
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    
    // get reply information if replying to a message
    let replyInfo = null;
    if (replyingTo !== null) {
      const repliedMessage = messages[replyingTo];
      if (repliedMessage) {
        console.log(messages[replyingTo])
        replyInfo = {
          replyToId: replyingTo, 
          replyToUsername: repliedMessage.username, 
          replyToMessage: repliedMessage.message
        };
        console.log("Replied message" + repliedMessage.message)
      }
    }
    
    DMChatService.sendMessageToDM(props.dmId, message, replyInfo);
    setMessage("");
    setReplyingTo(null); // Clear reply after sending
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
            maxHeight:
              "calc(100vh - " +
              (chatbarRef.current ? 115 + chatbarHeight : 0) +
              "px)",
            overflowY: "auto",
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
          {messages.map((message: IChannelMessageModel, index: number) => (
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
                "&:hover": {
                  backgroundColor: "#F0F0F050",
                },
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
                  userActivity={Activity.Offline}
                  onReply={handleReply}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Reply indicator at the bottom (beside the input field)*/}
      {replyingTo !== null && messages[replyingTo] && (
        <Grid container alignItems="center" sx={{ backgroundColor: "#4a644a", padding: "4px 8px", borderRadius: "4px 4px 0 0" }}>
          <Grid sx={{ flexGrow: 1 }}>
            <Typography variant="caption" component="div">
              Replying to <b>{messages[replyingTo].username}</b>: {messages[replyingTo].message.substring(0, 50)}{messages[replyingTo].message.length > 50 ? "..." : ""}
            </Typography>
          </Grid>
          <Grid>
            <IconButton size="small" onClick={cancelReply}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Grid>
        </Grid>
      )}

      <Grid
        container
        spacing={1}
        alignItems="center"
        className={"chat-bar-wrapper"}
      >
        <Grid sx={{ flexGrow: 1 }}>
          <TextField
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
            placeholder={replyingTo !== null ? "Reply to message..." : "Type a message..."}
          />
        </Grid>
        <IconButton onClick={sendMessage}>
          <SendIcon />
        </IconButton>
      </Grid>
    </Box>
  );
}
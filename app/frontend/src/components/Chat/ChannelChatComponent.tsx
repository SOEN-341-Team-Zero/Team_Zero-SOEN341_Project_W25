import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Checkbox,
  CircularProgress,
  Grid2 as Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import wretch from "wretch";
import abort from "wretch/addons/abort";
import { IChannelMessageModel } from "../../models/models";
import ChannelChatService from "../../services/ChannelChatService";
import "../../styles/ChatArea.css";
import { API_URL } from "../../utils/FetchUtils";
import DeleteChannelMessagesButton from "../Buttons/DeleteChannelMessagesButton";
import ChatMessage from "./ChatMessage";
import RequestCreationPrompt from "./RequestCreationPrompt";

interface ChannelChatComponentProps {
  channelId: number;
  userId: number;
  userName: string;
  isUserAdmin: boolean;
}

export default function ChannelChatComponent(props: ChannelChatComponentProps) {
  const [messages, setMessages] = useState<IChannelMessageModel[]>([]);
  const [message, setMessage] = useState("");
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [selection, setSelection] = useState<number[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const chatbarRef = useRef<HTMLInputElement>(null);
  const [chatbarHeight, setChatbarHeight] = useState<number>(
    chatbarRef.current ? chatbarRef.current.getBoundingClientRect().height : 55,
  );
  const [displayRequestOptions, setDisplayRequestOptions] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    //on mount, might be useless?
    fetchMessages;
  }, []);
  useEffect(() => {
    if (!props.channelId) {
      setMessages([]);
      return;
    }; // avoid starting connections/fetching dms if the channel isn't selected
    setDisplayRequestOptions(false);

    const startConnection = async () => {
      await ChannelChatService.startConnection(props.channelId);
    };

    startConnection();
    //fetching the previous messages from the DB

    fetchMessages();

    const messageHandler = (
      senderId: number,
      username: string,
      message: string,
      sentAt: string,
      channelId: number, //dont remove this
      replyToId?: number,
      replyToUsername?: string,
      replyToMessage?: string,
    ) => {
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

    ChannelChatService.onMessageReceived(messageHandler);
    setMessages([]); // clear messages on channel change
    setReplyingTo(null);
  }, [props.channelId]);

  useEffect(() => {
    if (chatbarRef?.current) {
      setChatbarHeight(chatbarRef.current.getBoundingClientRect().height);
    }
  }, [message]);

  const previousRequestRef = useRef<any>(null);
  const fetchMessages = async () => {
    setLoading(true);
    const request = wretch(
      `${API_URL}/api/chat/channel?channelId=${props.channelId}`,
    )
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .get();

    previousRequestRef.current = request;
    try {
      const data: any = await request.json();
      if (previousRequestRef.current === request) {
        const formattedMessages = data.messages.map((msg: any) => ({
          senderId: msg.sender_id,
          username: msg.senderUsername,
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
        if (err.status === 403) {
          console.error(
            "Access forbidden: You do not have permission to access this resource.",
          );
          setDisplayRequestOptions(true);
        } else {
          console.error("Fetch error:", err);
        }
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
        replyInfo = {
          replyToId: replyingTo, // use index since we don't have actual message_id
          replyToUsername: repliedMessage.username,
          replyToMessage: repliedMessage.message,
        };
      }
    }

    ChannelChatService.sendMessageToChannel(
      props.channelId,
      props.userId,
      message,
      replyInfo,
    );

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

  const deleteMessages = () => {
    setMessages((prevMessages) =>
      prevMessages.filter((_, index) => !selection.includes(index)),
    );
    setSelection([]);
  };

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
      }}
    >
      <Box className={"text-container"} pl={isSelecting ? "0px" : "16px"}>
        <Box
          className={"text-content"}
          sx={{
            maxHeight:
              "calc(100vh - " +
              (chatbarRef.current ? 115 + chatbarHeight : 0) +
              "px)",
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
          ) : displayRequestOptions ? (
            <RequestCreationPrompt />
          ) : (
            messages.map((message: IChannelMessageModel, index: number) => (
              <Box
                key={index} // would ideally be message_id
                mb={"2px"}
                className="message-container"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  justifyContent: "space-between",
                  backgroundColor: selection.includes(index)
                    ? "#AAAAAA50"
                    : "inherit",
                  borderRadius: "4px",
                }}
              >
                {isSelecting && (
                  <Checkbox
                    sx={{
                      justifySelf: "start",
                      height: "52px",
                      minWidth: "52px",
                      width: "52px",
                    }}
                    checked={selection.includes(index)}
                    onClick={() =>
                      setSelection((prevSelections) =>
                        prevSelections.includes(index)
                          ? prevSelections.filter((i) => i !== index)
                          : [...prevSelections, index],
                      )
                    }
                  />
                )}
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
                  />
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Box>
      <Grid container spacing={1}>
        {props.isUserAdmin && (
          <Grid className={"delete-messages-button-wrapper"}>
            <DeleteChannelMessagesButton
              messageIds={selection}
              channelId={props.channelId}
              deleteMessages={deleteMessages}
              isSelecting={isSelecting}
              setIsSelecting={setIsSelecting}
              selectionCount={selection.length}
              setSelection={setSelection}
            />
          </Grid>
        )}

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

        <Grid
          container
          className={"chat-bar-wrapper"}
          alignItems="center"
          size={props.isUserAdmin ? "grow" : 12}
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

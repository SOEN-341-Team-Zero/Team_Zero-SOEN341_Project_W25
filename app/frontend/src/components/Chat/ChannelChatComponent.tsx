import SendIcon from "@mui/icons-material/Send";
import {
  Box,
  Checkbox,
  Grid2 as Grid,
  IconButton,
  TextField,
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

enum Activity {
  Online = "Online",
  Away = "Away",
  Offline = "Offline"
}

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
  const chatbarRef = useRef<HTMLInputElement>(null);
  const [chatbarHeight, setChatbarHeight] = useState<number>(
    chatbarRef.current ? chatbarRef.current.getBoundingClientRect().height : 55,
  );

  useEffect(() => {
    //on mount, might be useless?
    fetchMessages;
  }, []);
  useEffect(() => {
    if (!props.channelId) return; // avoid starting connections/fetching dms if the channel isn't selected

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
    ) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { senderId, username, message, sentAt },
      ]);
    };

    ChannelChatService.onMessageReceived(messageHandler);
    setMessages([]); // clear messages on channel change
  }, [props.channelId]);

  useEffect(() => {
    if (chatbarRef?.current) {
      setChatbarHeight(chatbarRef.current.getBoundingClientRect().height);
    }
  }, [message]);

  const previousRequestRef = useRef<any>(null);
  const fetchMessages = async () => {
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
    ChannelChatService.sendMessageToChannel(
      props.channelId,
      props.userId,
      message,
    );
    setMessage("");
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
              key={index} // would ideally be message_id
              mb={"2px"}
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
                  userActivity={Activity.Offline}
                />
              </Box>
            </Box>
          ))}
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
        <Grid
          container
          className={"chat-bar-wrapper"}
          alignItems="center"
          size={props.isUserAdmin ? "grow" : 12}
        >
          <Grid sx={{ flexGrow: 1 }}>
            <TextField
              sx={{
                minHeight: "52px",
                border: "none",
                textWrap: "wrap",
                width: "100%",
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

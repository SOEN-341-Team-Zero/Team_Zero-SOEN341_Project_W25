import SendIcon from "@mui/icons-material/Send";
import { Box, Grid2 as Grid, IconButton, TextField } from "@mui/material";
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
  const chatbarRef = useRef<HTMLInputElement>(null);
  const [chatbarHeight, setChatbarHeight] = useState<number>(
    chatbarRef.current ? chatbarRef.current.getBoundingClientRect().height : 55,
  );

  useEffect(() => {
    if (!props.dmId) return; // avoid starting connections/fetching dms if the channel isn't selected

    const startConnection = async () => {
      await DMChatService.startConnection(props.dmId);
    };

    startConnection();

    //TODO this probably won't work, see if there's a way to replicate what there is in
    // ChannelChatComponent.tsx

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

    DMChatService.onMessageReceived(messageHandler);
    setMessages([]); // clear messages on dm change
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
    DMChatService.sendMessageToDM(props.dmId, message);
    setMessage("");
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
        {/* placeholder styling */}
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
            <ChatMessage
              key={index}
              id={index}
              message={message}
              userId={props.userId}
              userActivity={Activity.Offline}
            />
          ))}
        </Box>
      </Box>

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
              maxWidth: "100%",
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
          ></TextField>
        </Grid>
        <IconButton
          sx={{ height: "52px", width: "52px" }}
          onClick={sendMessage}
        >
          <SendIcon />
        </IconButton>
      </Grid>
    </Box>
  );
}

import { Box, Grid2 as Grid, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import wretch from "wretch";
import abort from "wretch/addons/abort";
import { IChannelMessageModel } from "../models/models";
import { useApplicationStore } from "../stores/ApplicationStore";
import "../styles/ChatArea.css";
import ChatMessage from "./ChatMessage";
import DMChatService from "./DMChatService";
interface DMChatComponentProps {
  dmId: number;
  userId: number;
  userName: string;
}

export default function DMChatComponent(props: DMChatComponentProps) {
  const [messages, setMessages] = useState<IChannelMessageModel[]>([]);
  const [message, setMessage] = useState("");

  const applicationState = useApplicationStore();

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
      console.log("Message received:", { senderId, username, message, sentAt });
      setMessages((prevMessages) => [
        ...prevMessages,
        { senderId, username, message, sentAt },
      ]);
    };

    DMChatService.onMessageReceived(messageHandler);
    setMessages([]); // clear messages on dm change
  }, [props.dmId]);

  const previousRequestRef = useRef<any>(null);
  const fetchMessages = async () => {
    const request = wretch(
      `http://localhost:3001/api/chat/dm`,
    )
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .get();

    previousRequestRef.current = request;
    try {
      const data: any = await request.json();
      if (previousRequestRef.current === request) {
        const currentDMChannel = data.dms.find((dmChannel:any) => dmChannel.dm_id === props.dmId);
        const formattedMessages = currentDMChannel.messages.map((msg: any) => ({
          senderId: msg.sender_id,
          username: msg.sender_id === props.userId ? props.userName : currentDMChannel.otherUser.username,
          message: msg.message_content, 
          sentAt: msg.sent_at,
        }));

        setMessages(formattedMessages);
        console.log("Formatted messages:", formattedMessages);
      } else {
        //we abort the fetch if theres another fetch (fetch done later) request
        console.log("no refetch");
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
            maxHeight: "calc(100vh - 180px)",
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
            />
          ))}
        </Box>
      </Box>

      <Grid container spacing={1} className={"chat-bar-wrapper"}>
        <TextField
          sx={{
            minHeight: "52px",
            border: "none",
            textWrap: "wrap",
            maxWidth: "100%",
          }}
          fullWidth
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
    </Box>
  );
}

import { useEffect, useState } from "react";
import ChannelChatService from "./ChannelChatService";
import { Box, Container, Grid2 as Grid, TextField } from "@mui/material";
import { IChannelMessageModel } from "../models/models";
import "../styles/ChatArea.css";
import ChatMessage from "./ChatMessage";
import wretch from "wretch";

interface ChannelChatComponentProps {
  channelId: number;
  userId: number;
  userName: string;
}

export default function ChannelChatComponent(props: ChannelChatComponentProps) {
  const [messages, setMessages] = useState<IChannelMessageModel[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const startConnection = async () => {
      await ChannelChatService.startConnection(props.channelId);
    };
    
    startConnection();
    //fetching the previous messages from the DB
    wretch(`http://localhost:3001/api/chat/channel?channelId=${props.channelId}`)
    .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
    .get()
    .json((data) => {

      const formattedMessages = data.messages.map((msg: any) => {
        return {
          senderId: msg.sender_id,
          username: msg.senderUsername,
          message: msg.message_content,
          sentAt: msg.sent_at,
        };
      });
  
      setMessages(formattedMessages);
      console.log("Formatted messages:", formattedMessages);  // Log to see the structure
    })
    .catch((err) => console.error(err));
  

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

    ChannelChatService.onMessageReceived(messageHandler);
    setMessages([]);
  }, [props.channelId]);

  const sendMessage = () => {
    if (!message.trim()) return;
    console.log(message);
    ChannelChatService.sendMessageToChannel(
      props.channelId,
      props.userId,
      message,
    );
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

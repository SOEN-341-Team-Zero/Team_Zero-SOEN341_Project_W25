import SendIcon from "@mui/icons-material/Send";
import { Grid2 as Grid, IconButton, TextField } from "@mui/material";
import { useState } from "react";

interface ChatBarProps {
  loading: boolean;
  replyingTo: number | null;
  chatbarRef: React.RefObject<HTMLDivElement>;
  sendMessage: (message: string) => void;
  audioUrl?: string;
}

export default function ChatBar(props: Readonly<ChatBarProps>) {
  const [message, setMessage] = useState<string>("");

  const handleSendMessage = () => {
    props.sendMessage(message);
    setMessage("");
  };

  return (
    <Grid
      container
      className="chat-bar-wrapper"
      alignItems="center"
      size={"grow"}
    >
      {props.audioUrl && (
        <Grid
          size={{ xs: 5, lg: "auto" }}
          sx={{
            display: "flex",
            maxWidth: "98%",
            alignItems: "center",
            px: 1,
            justifyContent: "center",
          }}
        >
          <audio
            key={props.audioUrl}
            style={{
              maxHeight: "48px",
            }}
            controls
          >
            <source src={props.audioUrl} />
            Audio playback not supported
          </audio>
        </Grid>
      )}
      <Grid
        size={"grow"}
        sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}
      >
        <TextField
          disabled={props.loading}
          sx={{
            minHeight: "52px",
            border: "none",
            textWrap: "wrap",
            width: "100%",
            borderRadius: props.replyingTo !== null ? "0 0 4px 4px" : "4px",
          }}
          ref={props.chatbarRef}
          fullWidth
          multiline
          maxRows={5}
          autoComplete="off"
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(keyEvent) => {
            if (keyEvent.key === "Enter" && !keyEvent.shiftKey) {
              keyEvent.preventDefault();
              handleSendMessage();
            }
          }}
          value={message}
          placeholder={
            props.replyingTo !== null
              ? "Reply to message..."
              : "Type a message..."
          }
        />
        <IconButton onClick={handleSendMessage}>
          <SendIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
}

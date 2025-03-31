import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Grid2 as Grid,
  IconButton,
  TextField,
  Typography,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import wretch from "wretch";
import abort from "wretch/addons/abort";
import { IChannelMessageModel } from "../../models/models";
import DMChatService from "../../services/DMChatService";
import "../../styles/ChatArea.css";
import { API_URL } from "../../utils/FetchUtils";
import ChatMessage from "./ChatMessage";
import { useApplicationStore } from "../../stores/ApplicationStore";
import MicIcon from "@mui/icons-material/Mic";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import DeleteIcon from "@mui/icons-material/Delete";

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
  const [recording, setRecording] = useState(false);
  const mediaStream = useRef<MediaStream | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string>();
  var [abort, setAbort] = useState<boolean>(false);

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
      audioURL? : string
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
        audioURL
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
          audioURL
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
          audioURL: msg.audioURL || undefined
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
    const finalMessage = audioURL ? "AUDIO" : message.trim();

    if (!finalMessage) {
      return;
    }

    let replyInfo = null;
    if (replyingTo !== null) {
      const repliedMessage = messages[replyingTo];
      if (repliedMessage) {
        replyInfo = {
          replyToId: replyingTo,
          replyToUsername: repliedMessage.username,
          replyToMessage: repliedMessage.message,
        };
      }
    }

    DMChatService.sendMessageToDM(
      props.dmId,
      finalMessage,
      replyInfo,
      audioURL 
    );

    setMessage("");
    setAudioBlob(null);
    setAudioURL(undefined);
    setReplyingTo(null);
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
  const startRecording = async () => {
    setAudioBlob(null);
    try {
      mediaStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(mediaStream.current);
      mediaRecorder.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      recorder.onstop = () => {
        if (!abort) {
          const newBlob = new Blob(audioChunks.current, { type: "audio/webm" });
          // Convert the Blob to Base64
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = reader.result as string;
            setAudioURL(base64Audio);
            setAudioBlob(null); 
          };
          reader.readAsDataURL(newBlob); 
          audioChunks.current = [];
        } else {
          setAudioBlob(null);
          setAudioURL(undefined);
          setAbort(false);
        }
      };
      recorder.start();
      setRecording(true);
      playRecordingSound();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };
  

  const playRecordingSound = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioCtx.close();
    }, 250);
  };

  const stopRecording = () => {
    if(mediaRecorder.current) {
      mediaRecorder.current.stop();
      if(mediaStream.current) mediaStream.current.getTracks().forEach((track: MediaStreamTrack) => track.stop())
      setRecording(false);
    }
  };

  const abortRecording = () => {
    if(recording) {
      stopRecording();
      setAbort(true);
    } else {
      setAudioBlob(null);
      setAudioURL(undefined);
    }
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
      <Grid className={"voice-recording-button-wrapper"}>
                <Tooltip title="Record voice note"><IconButton sx={{ height: "52px", width: "52px" }} onClick={() => {recording ? stopRecording() : startRecording()}}>{recording ? <StopCircleIcon/> : <MicIcon/>}</IconButton></Tooltip>
                {(recording || audioBlob) && <Tooltip title="Delete voice note"><IconButton sx={{ height: "52px", width: "52px" }} onClick={abortRecording}>{<DeleteIcon/>}</IconButton></Tooltip>}
              </Grid>
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
        spacing={1}
        alignItems="center"
        className={"chat-bar-wrapper"}
      >
         {audioURL && <audio controls><source src={audioURL}/>Audio playback not supported</audio>}
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
              replyingTo !== null ? "Reply to message..." : "Type a message..."
            }
          />
        </Grid>
        <IconButton onClick={sendMessage}>
          <SendIcon />
        </IconButton>
      </Grid>
    </Box>
  );
}

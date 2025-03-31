import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import MicIcon from "@mui/icons-material/Mic";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Checkbox,
  CircularProgress,
  Grid2 as Grid,
  IconButton,
  TextField,
  Typography,
  Tooltip,

} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import wretch from "wretch";
import abort from "wretch/addons/abort";
import { IChannelMessageModel, IUserModel } from "../../models/models";
import ChannelChatService from "../../services/ChannelChatService";
import "../../styles/ChatArea.css";
import { API_URL } from "../../utils/FetchUtils";
import DeleteChannelMessagesButton from "../Buttons/DeleteChannelMessagesButton";
import ChatMessage from "./ChatMessage";
import RequestCreationPrompt from "./RequestCreationPrompt";
import { useUserStore } from "../../stores/UserStore";
import AudioPlayer from "./AudioPlayer";

interface ChannelChatComponentProps {
  channelId: number;
  userId: number;
  userName: string;
  isUserAdmin: boolean;
}

export default function ChannelChatComponent(props: ChannelChatComponentProps) {
  const userStore = useUserStore();
  const [messages, setMessages] = useState<IChannelMessageModel[]>([]);
  const [message, setMessage] = useState("");
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [selection, setSelection] = useState<number[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const chatbarRef = useRef<HTMLInputElement>(null);
  const [chatbarHeight, setChatbarHeight] = useState<number>(
    chatbarRef.current ? chatbarRef.current.getBoundingClientRect().height : 55,
  );
  const [displayRequestOptions, setDisplayRequestOptions] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [recording, setRecording] = useState(false);
  const mediaStream = useRef<MediaStream | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string>();
  var [abort, setAbort] = useState<boolean>(false);

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
      channelId: number,
      replyToId?: number,
      replyToUsername?: string,
      replyToMessage?: string,
      reactions?: string[],
      reactionUsers?: IUserModel[],
      audioURL?: string | undefined
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
          reactions,
          reactionUsers,
          audioURL
        },
      ]);
    };

    const updateHandler = (
      senderId: number,
      sentAt: string,
      reactions: string[],
      reactionUsers: IUserModel[],
    ) => {
      setMessages(messages =>
        messages.map(msg => {
          if (msg.senderId === senderId && msg.sentAt === sentAt) {
            return {senderId: msg.senderId,
              username: msg.username,
              message: msg.message,
              sentAt: msg.sentAt,
              replyToId: msg.replyToId,
              replyToUsername: msg.replyToUsername,
              replyToMessage: msg.replyToMessage,
              reactions: reactions,
              reactionUsers: reactionUsers,
              audioURL: msg.audioURL};
          } else return msg;
        })
      );
    };

    ChannelChatService.onMessageReceived(messageHandler);
    ChannelChatService.onUpdatedMessage(updateHandler);
    setMessages([]); 
    setReplyingTo(null);
  }, [props.channelId]);

  useEffect(() => {
    if (chatbarRef?.current) {
      setChatbarHeight(chatbarRef.current.getBoundingClientRect().height);
    }
  }, [message]);

  useEffect(() => {if(abort) {
      setAudioBlob(null);
      setAudioURL(undefined);
      setAbort(false);
    }
  }, [audioBlob, audioURL]);

  const previousRequestRef = useRef<any>(null);
  const fetchMessages = async () => {
    setLoading(true);
    const request = wretch(`${API_URL}/api/chat/channel?channelId=${props.channelId}`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .get();

    previousRequestRef.current = request;
    try {
      const data: any = await request.json();
      //console.log(data);
      if (previousRequestRef.current === request) {
        interface RawMessage {
          sender_id: number;
          senderUsername: string;
          message_content: string;
          sent_at: string;
          reply_to_id?: number;
          reply_to_username?: string;
          reply_to_message?: string;
          reactions?: string[];
          reaction_users: number[];
          audioURL?: string | undefined;
        }
        const formattedMessages: IChannelMessageModel[] = data.messages.map((msg: RawMessage) => ({
          senderId: msg.sender_id,
          username: msg.senderUsername,
          message: msg.message_content,
          sentAt: msg.sent_at,
          replyToId: msg.reply_to_id ?? undefined,
          replyToUsername: msg.reply_to_username ?? undefined,
          replyToMessage: msg.reply_to_message ?? undefined,
          reactions: msg.reactions ?? undefined,
          reactionUsers: (msg.reaction_users ? msg.reaction_users.map(i => ({user_id: i, username: "", isAdmin: false, activity: "Offline"})) : undefined) ?? undefined,
          audioURL: msg.audioURL ?? undefined
        }));

        setMessages(formattedMessages);
      } else abort; 
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
    } finally {setLoading(false);}
  };

  const removeReaction = (emoji: string, reactions: string[], reactionUsers: IUserModel[]) => {
    let newReactions = [];
    for(let i = 0; i < reactions.length; i++) if(!(reactions[i] === emoji && reactionUsers[i].user_id == (userStore.user ? userStore.user.user_id : -2))) newReactions.push(reactions[i]);
    return newReactions;
  }
  const removeUser = (emoji: string, reactions: string[], reactionUsers: IUserModel[]) => {
    let newUsers = [];
    for(let i = 0; i < reactions.length; i++) if(!(reactions[i] === emoji && reactionUsers[i].user_id == (userStore.user ? userStore.user.user_id : -2))) newUsers.push(reactionUsers[i].user_id);
    return newUsers;
  }

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


    ChannelChatService.sendMessageToChannel(
      props.channelId,
      props.userId,
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

  const deleteMessages = () => {
    setMessages((prevMessages) =>
      prevMessages.filter((_, index) => !selection.includes(index)),
    );
    setSelection([]);
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
            <RequestCreationPrompt fetchMessages={fetchMessages} />
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
                    emojiReactions={message.reactions || []}
                    userEmojiReactions={(message.reactions ?? [])
                      .map((reaction, i) => ((message.reactionUsers ?? [])[i].user_id === props.userId ? reaction : null))
                      .filter((reaction): reaction is string => Boolean(reaction))}
                      onReact={(emoji, increase) => {
                        const newReactions = increase 
                          ? [...(message.reactions ?? []), emoji] 
                          : removeReaction(emoji, message.reactions ?? [], message.reactionUsers ?? []);
                        const currentUserId = userStore.user?.user_id ?? -1; 
                        const newReactionUsers = increase
                          ? [...(message.reactionUsers?.map(u => u.user_id) ?? []), currentUserId] 
                          : removeUser(emoji, message.reactions ?? [], message.reactionUsers ?? []);
                      
                        ChannelChatService.updateChannelReactions(
                          props.channelId,
                          message.senderId,
                          message.sentAt,
                          newReactions,         
                          newReactionUsers      
                        );
                      }}
                  />
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Box>
      {!displayRequestOptions && <Grid container spacing={1}>
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

        {/* Voice Recording */}
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
          className={"chat-bar-wrapper"}
          alignItems="center"
          size={props.isUserAdmin ? "grow" : 12}
        >
          {audioURL && <audio controls><source src={audioURL}/>Audio playback not supported</audio>}
            <Grid sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
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
            <IconButton onClick={sendMessage}>
              <SendIcon />
            </IconButton>
            </Grid>
        </Grid>
      </Grid>}
    </Box>
  );
};
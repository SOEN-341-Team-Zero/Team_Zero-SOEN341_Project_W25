import { Box, Container, Grid2 as Grid, TextField } from "@mui/material";
import { useApplicationStore } from "../stores/ApplicationStore";
import { useUserStore } from "../stores/UserStore";
import "../styles/ChatArea.css";
import ChannelChatComponent from "./ChannelChatComponent";
import ChatAreaHeader from "./ChatAreaHeader";

interface ChatAreaProps {
  isDirectMessage?: boolean;
  isChannel?: boolean;
  isUserAdmin: boolean;
}

export default function ChatArea(props: ChatAreaProps) {
  const applicationState = useApplicationStore();
  const userState = useUserStore();

  const currentChannel = applicationState.selectedChannel;

  return (
    <main
      className={"panel main"}
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        padding: "8px",
        margin: "6px",
      }}
    >
      <ChatAreaHeader currentChannel={currentChannel} />
      <ChannelChatComponent
        channelId={currentChannel?.id ?? 0}
        userId={userState.user?.user_id ?? 0}
        userName={userState.user?.username ?? ""}
        isUserAdmin={props.isUserAdmin}
      />
    </main>
  );
}

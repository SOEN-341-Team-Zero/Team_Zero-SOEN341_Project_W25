import { useApplicationStore, ViewModes } from "../stores/ApplicationStore";
import { useUserStore } from "../stores/UserStore";
import "../styles/ChatArea.css";
import ChannelChatComponent from "./ChannelChatComponent";
import ChatAreaChannelHeader from "./ChatAreaChannelHeader.tsx";
import ChatAreaDMHeader from "./ChatAreaDMHeader.tsx";

interface ChatAreaProps {
  isDirectMessage?: boolean;
  isChannel?: boolean;
}

export default function ChatArea(props: ChatAreaProps) {
  const applicationState = useApplicationStore();
  const userState = useUserStore();

  const currentChannel = applicationState.selectedChannel;
  const currentChat = applicationState.selectedChat;

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
      {applicationState.viewMode === ViewModes.Channel && (
        <ChatAreaChannelHeader currentChannel={currentChannel} />
      )}

      {applicationState.viewMode === ViewModes.DirectMessage && (
        <ChatAreaDMHeader currentChat={currentChat} />
      )}

      <ChannelChatComponent
        channelId={currentChannel?.id ?? 0}
        userId={userState.user?.user_id ?? 0}
        userName={userState.user?.username ?? ""}
      />
    </main>
  );
}

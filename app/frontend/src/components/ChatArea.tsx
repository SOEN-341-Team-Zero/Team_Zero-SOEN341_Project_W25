import { useApplicationStore, ViewModes } from "../stores/ApplicationStore";
import { useUserStore } from "../stores/UserStore";
import "../styles/ChatArea.css";
import ChannelChatComponent from "./ChannelChatComponent";
import ChatTeamsChannelHeader from "./ChatTeamsChannelHeader.tsx";
import ChatAreaDMHeader from "./ChatAreaDMHeader.tsx";
import DMChatComponent from "./DMChatComponent.tsx";

interface ChatAreaProps {
  isDirectMessage?: boolean;
  isChannel?: boolean;
  isUserAdmin: boolean;
}

export default function ChatArea(props: ChatAreaProps) {
  const applicationState = useApplicationStore();
  const userState = useUserStore();

  const currentChannel = applicationState.selectedChannel;
  const currentDMChannel = applicationState.selectedDMChannel;

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
      {applicationState.viewMode === ViewModes.Team && (
        <>
          <ChatTeamsChannelHeader currentChannel={currentChannel} />
          <ChannelChatComponent
            channelId={currentChannel?.id ?? 0}
            userId={userState.user?.user_id ?? 0}
            userName={userState.user?.username ?? ""}
            isUserAdmin={props.isUserAdmin}
          />
        </>
      )}

      {applicationState.viewMode === ViewModes.DirectMessage && (
        <>
          <ChatAreaDMHeader currentDMChannel={currentDMChannel} />
          <DMChatComponent
            dmId={currentDMChannel?.dm_id ?? 0}
            userId={userState.user?.user_id ?? 0}
            userName={userState.user?.username ?? ""}
            isUserAdmin={props.isUserAdmin}
          />
        </>
      )}
    </main>
  );
}

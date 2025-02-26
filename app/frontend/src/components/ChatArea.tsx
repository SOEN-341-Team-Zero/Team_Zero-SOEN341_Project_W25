import { useApplicationStore, ViewModes } from "../stores/ApplicationStore";
import { useUserStore } from "../stores/UserStore";
import "../styles/ChatArea.css";
import ChannelChatComponent from "./ChannelChatComponent";
import ChatTeamsChannelHeader from "./ChatTeamsChannelHeader.tsx";
import ChatAreaDMHeader from "./ChatAreaDMHeader.tsx";
import DMChatComponent from "./DMChatComponent.tsx";
import { useMediaQuery, useTheme } from "@mui/material";

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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <main
      className={"panel main"}
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        padding: "8px",
        margin: "6px",
        height: isMobile ? "96.6vh" : "auto",
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
          />
        </>
      )}
    </main>
  );
}

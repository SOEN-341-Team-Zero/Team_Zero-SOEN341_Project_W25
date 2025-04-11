import { useMediaQuery, useTheme } from "@mui/material";
import {
  useApplicationStore,
  ViewModes,
} from "../../stores/ApplicationStore.ts";
import { useUserStore } from "../../stores/UserStore.ts";
import "../../styles/ChatArea.css";
import Dashboard from "../Dashboard/Dashboard.tsx";
import MobileToolbar from "../MobileToolbar.tsx";
import ChannelChatComponent from "./ChannelChatComponent";
import ChatAreaDMHeader from "./ChatAreaDMHeader.tsx";
import ChatTeamsChannelHeader from "./ChatTeamsChannelHeader.tsx";
import DMChatComponent from "./DMChatComponent.tsx";

interface ChatAreaProps {
  isUserAdmin: boolean;
  toggleSidebar: () => void;
}

export default function ChatArea(props: Readonly<ChatAreaProps>) {
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
        overflowX: "hidden",
      }}
    >
      {isMobile && <MobileToolbar toggleSidebar={props.toggleSidebar} />}
      {applicationState.viewMode === ViewModes.Dashboard && <Dashboard />}

      {applicationState.viewMode === ViewModes.Team && (
        <>
          <ChatTeamsChannelHeader currentChannel={currentChannel} />
          <ChannelChatComponent
            channelId={currentChannel?.id ?? 0}
            userId={userState.user?.user_id ?? 0}
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

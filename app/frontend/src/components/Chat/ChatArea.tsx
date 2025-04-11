import {
  AppBar,
  Grid2 as Grid,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  useApplicationStore,
  ViewModes,
} from "../../stores/ApplicationStore.ts";
import { useUserStore } from "../../stores/UserStore.ts";
import "../../styles/ChatArea.css";
import ChannelChatComponent from "./ChannelChatComponent";
import ChatAreaDMHeader from "./ChatAreaDMHeader.tsx";
import ChatTeamsChannelHeader from "./ChatTeamsChannelHeader.tsx";
import DMChatComponent from "./DMChatComponent.tsx";
import Dashboard from "../Dashboard/Dashboard.tsx";
import MobileToolbar from "../MobileToolbar.tsx";

interface ChatAreaProps {
  isDirectMessage?: boolean;
  isChannel?: boolean;
  isUserAdmin: boolean;

  toggleSidebar: () => void;
}

export default function ChatArea(props: ChatAreaProps) {
  const applicationState = useApplicationStore();
  const userState = useUserStore();

  const currentChannel = applicationState.selectedChannel;
  const currentTeam = applicationState.selectedTeam;
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
          <ChatTeamsChannelHeader
            currentChannel={currentChannel}
           
          />
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

import { Box, Divider, List } from "@mui/material";
import { IDMChannelModel } from "../../models/models";
import CreateDMButton from "../Buttons/CreateDMButton";
import ChatListItem from "./ChatListItem";
import { useApplicationStore } from "../../stores/ApplicationStore";
export default function DMSidebarContent() {
  const dmChannels = useApplicationStore((state) => state.dmChannels);

  return (
    <>
      <Box
        className={"create-chat-button"}
        alignContent={"center"}
        justifyItems="center"
      >
        <CreateDMButton />
      </Box>

      <Divider variant="middle" />
      <List
        sx={{
          maxWidth: "100%",
          height: "calc(100vh - 96px)",
          overflowY: "scroll",
          scrollbarWidth: "none", // firefox
          "&::-webkit-scrollbar": {
            display: "none", // chrome, safari, opera
          },
        }}
      >
        {dmChannels.map(
          //render dms
          (dmChannel: IDMChannelModel) => (
            <ChatListItem key={dmChannel.dm_id} dmChannel={dmChannel} />
          ),
        )}
      </List>
    </>
  );
}

import { ListItemButton, ListItemText } from "@mui/material";
import { IDMChannelModel } from "../../models/models";
import { useApplicationStore } from "../../stores/ApplicationStore";
import { useUserStore } from "../../stores/UserStore";

interface IChatListItemProps {
  dmChannel: IDMChannelModel;
}

export default function ChatListItem(props: IChatListItemProps) {
  const setSelectedChat = useApplicationStore(
    (state) => state.setSelectedDMChannel,
  );

  const currentUser = useUserStore((state) => state.user);

  const displayName = props.dmChannel.otherUser.username;

  return (
    <ListItemButton
      className="dm-channel-item"
      key={props.dmChannel.dm_id}
      onClick={() => setSelectedChat(props.dmChannel)}
    >
      <ListItemText
        style={{ flexGrow: 1, width: "100%" }}
        primary={displayName}
        slotProps={{ primary: { noWrap: true } }}
      />
    </ListItemButton>
  );
}

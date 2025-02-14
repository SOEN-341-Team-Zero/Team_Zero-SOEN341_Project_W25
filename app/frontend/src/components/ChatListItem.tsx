import { ListItemButton, ListItemText } from "@mui/material";
import { IChatModel } from "../models/models";
import { useApplicationStore } from "../stores/ApplicationStore";
import { useUserStore } from "../stores/UserStore";
import { getChatDisplayName } from "../utils/ChatTitleUtils";

interface IChatListItemProps {
  chat: IChatModel;
}

export default function ChatListItem(props: IChatListItemProps) {
  const setSelectedChat = useApplicationStore((state) => state.setSelectedChat);

  const currentUser = useUserStore((state) => state.user);

  const displayName = getChatDisplayName(props.chat, currentUser?.username);

  return (
    <ListItemButton
      className="chat-item"
      key={props.chat.id}
      onClick={() => setSelectedChat(props.chat)}
    >
      <ListItemText
        style={{ flexGrow: 1, width: "100%" }}
        primary={displayName}
        slotProps={{ primary: { noWrap: true } }}
      />
    </ListItemButton>
  );
}

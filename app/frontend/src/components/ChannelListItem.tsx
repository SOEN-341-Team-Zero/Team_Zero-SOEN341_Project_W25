import {
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { IChannelModel } from "../models/models";
import { useState } from "react";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

interface IChannelListItemProps {
  channel: IChannelModel;
  isUserAdmin: boolean;
  setSelectedChannel: (channel: IChannelModel) => void;
}

export default function ChannelListItem(props: IChannelListItemProps) {
  const [areChannelActionsVisible, setAreChannelActionsVisible] =
    useState<boolean>(false);

  const handleHoverOverChannelItem = () => {
    if (props.isUserAdmin) {
      setAreChannelActionsVisible(true);
    }
  };

  return (
    <ListItemButton
      className="channel-item"
      key={props.channel.id}
      onClick={() => props.setSelectedChannel(props.channel)}
      onMouseOver={handleHoverOverChannelItem}
      onMouseLeave={() => setAreChannelActionsVisible(false)}
    >
      <ListItemText
        style={{ flexGrow: 1, width: "100%" }}
        primary={props.channel.channel_name}
        slotProps={{ primary: { noWrap: true } }}
      />
      {areChannelActionsVisible && (
        <IconButton sx={{ maxHeight: "24px", borderRadius: "4px" }} edge="end">
          <PersonAddIcon />
        </IconButton>
      )}
    </ListItemButton>
  );
}

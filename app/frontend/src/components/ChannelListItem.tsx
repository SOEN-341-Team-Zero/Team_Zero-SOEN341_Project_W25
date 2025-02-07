import {
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import { IChannelModel } from "../models/models";
import { useState } from "react";
import InviteToChannelButton from "./InviteToChannelButton";

interface IChannelListItemProps {
  channel: IChannelModel;
  isUserAdmin: boolean;
  setSelectedChannel: (channel: IChannelModel) => void;
  refetchData: () => void;
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
        <InviteToChannelButton
          teamId={props.channel.team_id}
          channelId={props.channel.id}
          channelName={props.channel.channel_name}
          refetchData={props.refetchData}
        />
      )}
    </ListItemButton>
  );
}

import { ListItemButton, ListItemText } from "@mui/material";
import { useState } from "react";
import { IChannelModel } from "../../models/models";
import { useApplicationStore } from "../../stores/ApplicationStore";
import InviteToChannelButton from "../Buttons/InviteToChannelButton";

interface IChannelListItemProps {
  channel: IChannelModel;
  isUserAdmin: boolean;
}

export default function ChannelListItem(props: IChannelListItemProps) {
  const setSelectedChannel = useApplicationStore(
    (state) => state.setSelectedChannel,
  );

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
      onClick={() => setSelectedChannel(props.channel)}
      onMouseOver={handleHoverOverChannelItem}
      onMouseLeave={() => setAreChannelActionsVisible(false)}
    >
      <ListItemText
        style={{ flexGrow: 1, width: "100%" }}
        primary={props.channel.channel_name}
        slotProps={{ primary: { noWrap: true } }}
      />
      <InviteToChannelButton
        displayButton={areChannelActionsVisible}
        teamId={props.channel.team_id}
        channelId={props.channel.id}
        channelName={props.channel.channel_name}
      />
    </ListItemButton>
  );
}

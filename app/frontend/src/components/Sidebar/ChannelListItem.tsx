import { ListItemButton, ListItemText } from "@mui/material";
import { useState } from "react";
import { IChannelModel } from "../../models/models";
import { useApplicationStore } from "../../stores/ApplicationStore";
import InviteToChannelButton from "../Buttons/InviteToChannelButton";
import { useUserStore } from "../../stores/UserStore";

interface IChannelListItemProps {
  channel: IChannelModel;
  isUserAdmin: boolean;
}

export default function ChannelListItem(props: IChannelListItemProps) {
  const currentUserId = useUserStore((state) => state.user?.user_id);

  const setSelectedChannel = useApplicationStore(
    (state) => state.setSelectedChannel,
  );

  const [areChannelActionsVisible, setAreChannelActionsVisible] =
    useState<boolean>(false);

  const handleHoverOverChannelItem = () => {
    if (!props.channel.is_public && props.channel.owner_id === currentUserId)
      setAreChannelActionsVisible(true);
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

      {!props.channel.is_public && (
        <InviteToChannelButton
          displayButton={areChannelActionsVisible}
          teamId={props.channel.team_id}
          channelId={props.channel.id}
          channelName={props.channel.channel_name}
          channelPub={props.channel.is_public}
        />
      )}
    </ListItemButton>
  );
}

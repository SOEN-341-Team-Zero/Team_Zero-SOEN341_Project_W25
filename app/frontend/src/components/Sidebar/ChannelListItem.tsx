import { ListItemButton, ListItemText, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { IChannelModel } from "../../models/models";
import { useApplicationStore } from "../../stores/ApplicationStore";
import InviteToChannelButton from "../Buttons/InviteToChannelButton";
import { useUserStore } from "../../stores/UserStore";
import wretch from "wretch"; // Import wretch
import { API_URL } from "../../utils/FetchUtils";
import { toast } from "react-toastify";

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

  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  // base handler taken from MUI react-menu Context demo code https://mui.com/material-ui/react-menu/
  const handleContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!props.channel.is_public && props.channel.owner_id !== currentUserId) {
      try {
        await wretch(
          `${API_URL}/api/home/can-access-channel?channelId=${props.channel.id}`,
        )
          .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
          .get()
          .res();

        setContextMenu(
          contextMenu === null
            ? {
                mouseX: e.clientX + 2,
                mouseY: e.clientY - 6,
              }
            : null,
        );
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent the click event from being triggered
    setContextMenu(null);
  };

  const handleLeave = (e: React.MouseEvent) => {
    // you'd want confirmation honestly
    try {
      wretch(`${API_URL}/api/add/leaveChannel?channelId=${props.channel.id}`)
        .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
        .post()
        .res((res) => {
          toast.success(`You have left ${props.channel.channel_name}`);
          setSelectedChannel(null);
        });
    } catch (error) {
      console.error("Failed to leave the channel", error);
    } finally {
      handleClose(e);
    }
  };

  return (
    <ListItemButton
      className="channel-item"
      key={props.channel.id}
      onContextMenu={handleContextMenu}
      onClick={() => setSelectedChannel(props.channel)}
      onMouseOver={handleHoverOverChannelItem}
      onMouseLeave={() => setAreChannelActionsVisible(false)}
    >
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem
          onClick={handleLeave}
        >{`Leave ${props.channel.channel_name}`}</MenuItem>
      </Menu>

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

import {
  Avatar,
  Box,
  Grid2 as Grid,
  ListItemButton,
  ListItemText,
  Tooltip,
} from "@mui/material";
import { IDMChannelModel, UserActivity } from "../../models/models";
import { useApplicationStore } from "../../stores/ApplicationStore";
import { useUserStore } from "../../stores/UserStore";
import { stringAvatar } from "../../utils/AvatarUtils";
import ActivityBadge from "../ActivityBadge";
import { useEffect, useState } from "react";
import { formatLastSeen } from "../../utils/TimeUtils";

interface IChatListItemProps {
  dmChannel: IDMChannelModel;
}

export default function ChatListItem(props: IChatListItemProps) {
  const setSelectedChat = useApplicationStore(
    (state) => state.setSelectedDMChannel,
  );

  const currentUser = useUserStore((state) => state.user);

  const displayName = props.dmChannel.otherUser.username;
  const userId = props.dmChannel.otherUser.user_id;
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  useEffect(() => {
    const fetchLastSeen = async () => {
      if (!userId) return;
      try {
        const response = await fetch('/api/home/last-seen', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ UserId: userId })
        });
        if (!response.ok) {
          throw new Error('Failed to fetch last seen data');
        }
        const data = await response.json();
        console.log("FETCHING TIMESTAMP:")
        console.log(data);
        setLastSeen(data.last_seen);
      } catch (error) {
        console.error('Error fetching last seen:', error);
      }
    };

    fetchLastSeen();
  }, [userId]);

  return (
    <ListItemButton
      className="dm-channel-item"
      key={props.dmChannel.dm_id}
      onClick={() => setSelectedChat(props.dmChannel)}
    >
      <Grid
        container
        width="100%"
        direction="row"
        spacing={1}
        sx={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <Grid size="auto">
        <Tooltip title={props.dmChannel.otherUser.activity === "Offline" ? `Last seen ${formatLastSeen(lastSeen)}` : props.dmChannel.otherUser.activity} placement="left">
        <Box>
          <ActivityBadge
            activity={props.dmChannel.otherUser.activity as UserActivity}
          >
            <Avatar
              {...stringAvatar(props.dmChannel.otherUser.username, {
                width: "32px",
                height: "32px",
              })}
            />
          </ActivityBadge>
        </Box>
      </Tooltip>
        </Grid>
        <Grid size="grow">
          <ListItemText
            style={{ width: "100%", textOverflow: "ellipsis" }}
            primary={props.dmChannel.otherUser.username}
            slotProps={{ primary: { noWrap: true } }}
          />
        </Grid>
      </Grid>
    </ListItemButton>
  );
}

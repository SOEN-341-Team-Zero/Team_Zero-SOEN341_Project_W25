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
      <Grid
        container
        width="100%"
        direction="row"
        spacing={1}
        sx={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <Grid size="auto">
          <Tooltip title={props.dmChannel.otherUser.activity} placement="left">
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

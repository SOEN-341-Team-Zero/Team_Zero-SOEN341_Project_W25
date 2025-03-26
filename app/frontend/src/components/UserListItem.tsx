import DeleteIcon from "@mui/icons-material/Delete";
import RateReviewIcon from "@mui/icons-material/RateReview";
import MessageIcon from "@mui/icons-material/Send";
import UndoIcon from "@mui/icons-material/Undo";
import {
  Avatar,
  Badge,
  Box,
  Grid2 as Grid,
  IconButton,
  ListItem,
  ListItemText,
  styled,
  Tooltip,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import wretch from "wretch";
import { IUserModel, UserActivity } from "../models/models";
import { useApplicationStore, ViewModes } from "../stores/ApplicationStore";
import { stringAvatar } from "../utils/AvatarUtils";
import { API_URL } from "../utils/FetchUtils";
import ActivityBadge from "./ActivityBadge";
import { formatLastSeen } from "../utils/TimeUtils";

interface IUserListItemProps {
  user: IUserModel;
  isHover: boolean;
  toBeDeleted: boolean;
  deletion: (user: IUserModel) => void;
  channelOwnerId?: number;
}

export default function UserListItem(props: IUserListItemProps) {
  const [rerender, setRerender] = useState<number>(0);
  const [isActionVisible, setIsActionVisible] = useState<boolean>(false);
  const applicationState = useApplicationStore();
  const setSelectedChat = useApplicationStore(
    (state) => state.setSelectedDMChannel,
  );

  const userId = props.user.user_id;
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  useEffect(() => {
    const fetchLastSeen = async () => {
      if (!userId) return;
      try {
        const response = await fetch("/api/home/last-seen", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ UserId: userId }),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch last seen data");
        }
        const data = await response.json();
        console.log("FETCHING TIMESTAMP:");
        console.log(data);
        setLastSeen(data.last_seen);
      } catch (error) {
        console.error("Error fetching last seen:", error);
      }
    };

    fetchLastSeen();
  }, [userId]);

  const [isCreateDMConfirmationVisible, setIsCreateDMConfirmationVisible] =
    useState<boolean>();

  const openDM = () => {
    if (
      !applicationState.dmChannels.find(
        (c) => c.otherUser.username == props.user.username,
      )
    ) {
      if (!isCreateDMConfirmationVisible) {
        setIsCreateDMConfirmationVisible(true);
        return;
      }

      if (props.user) {
        wretch(`${API_URL}/api/create/dm`)
          .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
          .post({ recipient_name: props.user.username })
          .res(() => {
            toast.success("Chat created successfully!");
            applicationState.refetchDMChannelsState();
            setRerender(rerender + 1);
          })
          .catch((error) => {
            applicationState.setViewMode(ViewModes.DirectMessage);
            applicationState.setSelectedDMChannel(
              applicationState.dmChannels.filter(
                (c) => c.otherUser.username == props.user.username,
              )[0],
            );
            setSelectedChat(
              applicationState.dmChannels.filter(
                (c) => c.otherUser.username == props.user.username,
              )[0],
            );
          })
          .finally(() => {
            setIsCreateDMConfirmationVisible(false);
          });
      }
    }
    applicationState.setViewMode(ViewModes.DirectMessage);
    applicationState.setSelectedDMChannel(
      applicationState.dmChannels.filter(
        (c) => c.otherUser.username == props.user.username,
      )[0],
    );
    setSelectedChat(
      applicationState.dmChannels.filter(
        (c) => c.otherUser.username == props.user.username,
      )[0],
    );
  };

  const handleMouseOver = () => {
    setIsActionVisible(true);
  };
  const handleMouseOut = () => {
    setIsActionVisible(false);
    setIsCreateDMConfirmationVisible(false);
  };

  // check if the user is the owner of the selected channel, if so, don't show the delete button under manage users
  const isUserTheSelectedChannelOwner =
    props.channelOwnerId == props.user.user_id;

  return (
    <ListItem
      className="user-item"
      key={props.user.user_id}
      sx={{
        border: "1px solid #669266",
        borderRadius: "4px",
        maxWidth: "100%",
        alignItems: "center",
      }}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      <Grid
        container
        width="100%"
        direction="row"
        spacing={1}
        sx={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <Grid size="auto">
          <Tooltip
            title={
              props.user.activity === "Offline"
                ? `Last seen ${formatLastSeen(lastSeen)}`
                : props.user.activity
            }
            placement="left"
          >
            <Box>
              <ActivityBadge activity={props.user.activity as UserActivity}>
                <Avatar {...stringAvatar(props.user.username)} />
              </ActivityBadge>
            </Box>
          </Tooltip>
        </Grid>
        <Grid size="grow">
          <ListItemText
            style={{ width: "100%", textOverflow: "ellipsis" }}
            primary={props.user.username}
            slotProps={{ primary: { noWrap: true } }}
          />
        </Grid>
        <Grid size={"auto"} display={isActionVisible ? "auto" : "none"}>
          {(props.isHover && (
            <IconButton size={"small"} onClick={openDM}>
              {isCreateDMConfirmationVisible ? (
                <RateReviewIcon sx={{ fontSize: "1rem" }} />
              ) : (
                <MessageIcon sx={{ fontSize: "1rem" }} />
              )}
            </IconButton>
          )) ||
            (props.toBeDeleted && (
              <IconButton onClick={() => props.deletion(props.user)}>
                <UndoIcon />
              </IconButton>
            )) ||
            (!isUserTheSelectedChannelOwner && (
              <IconButton onClick={() => props.deletion(props.user)}>
                <DeleteIcon />
              </IconButton>
            ))}
        </Grid>
      </Grid>
    </ListItem>
  );
}

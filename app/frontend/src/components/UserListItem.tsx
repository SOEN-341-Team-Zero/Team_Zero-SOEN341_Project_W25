import {
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Avatar,
  Grid2 as Grid,
} from "@mui/material";
import { toast } from "react-toastify";
import { IUserModel, IDMChannelModel } from "../models/models";
import { useApplicationStore } from "../stores/ApplicationStore";
import { stringAvatar } from "../utils/AvatarUtils";
import MessageIcon from "@mui/icons-material/Send";
import UndoIcon from "@mui/icons-material/Undo";
import DeleteIcon from "@mui/icons-material/Delete";
import { API_URL } from "../utils/FetchUtils";
import wretch from "wretch";
import { useState } from "react";
import RateReviewIcon from "@mui/icons-material/RateReview";

enum Activity {
  Online = "Online",
  Away = "Away",
  Offline = "Offline"
}

export enum ViewModes {
  Team = "team",
  DirectMessage = "dm",
}

interface IUserListItemProps {
  user: IUserModel;
  isHover: boolean;
  toBeDeleted: boolean;
  deletion: (user: IUserModel) => void;
}

export default function UserListItem(props: IUserListItemProps) {
  const [rerender, setRerender] = useState<number>(0);
  const [isActionVisible, setIsActionVisible] = useState<boolean>(false);
  const applicationState = useApplicationStore();
  const setSelectedChat = useApplicationStore(
    (state) => state.setSelectedDMChannel,
  );
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
          <Avatar {...stringAvatar(props.user.username)} />
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: props.user.activity == Activity.Online ? "green" : (props.user.activity == Activity.Away ? "orange" : "gray"),
              border: "2px solid black"
            }}
          />
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
            )) || (
              <IconButton onClick={() => props.deletion(props.user)}>
                <DeleteIcon />
              </IconButton>
            )}
        </Grid>
      </Grid>
    </ListItem>
  );
}

import { ListItem, ListItemText, IconButton, Box, Avatar, Grid2 as Grid } from "@mui/material";
import { toast } from "react-toastify";
import { IUserModel, IDMChannelModel } from "../models/models";
import { useApplicationStore } from "../stores/ApplicationStore";
import { stringAvatar } from "../utils/AvatarUtils";
import MessageIcon from "@mui/icons-material/Send";
import UndoIcon from "@mui/icons-material/Undo";
import DeleteIcon from "@mui/icons-material/Delete";
import { API_URL } from "../utils/FetchUtils";
import wretch from "wretch";
import {useState} from "react";

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
  const [rerender, setRerender ] = useState<number>(0);
  const applicationState = useApplicationStore();
  const setSelectedChat = useApplicationStore(
    (state) => state.setSelectedDMChannel,
  );

  const openDM = (user: IUserModel) => {
    if(!(applicationState.dmChannels.filter(c => c.otherUser.username == props.user.username)[0])) {
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
              applicationState.setSelectedDMChannel(applicationState.dmChannels.filter(c => c.otherUser.username == props.user.username)[0]);
              setSelectedChat(applicationState.dmChannels.filter(c => c.otherUser.username == props.user.username)[0]);
            });
        }
      }
      applicationState.setViewMode(ViewModes.DirectMessage);
      applicationState.setSelectedDMChannel(applicationState.dmChannels.filter(c => c.otherUser.username == props.user.username)[0]);
      setSelectedChat(applicationState.dmChannels.filter(c => c.otherUser.username == props.user.username)[0]);
  }

  return (
    <ListItem
      className="user-item"
      key={props.user.user_id}
      sx={{border: "1px solid #669266", borderRadius: "4px", margin: "4px", maxWidth: "195px"}}
    >
      <Grid container direction="row" spacing={1} sx={{justifyContent: "space-between", alignItems: "center"}}>
        <Grid size="auto">{props.isHover && (
          <IconButton onClick={() => openDM(props.user)}><MessageIcon/></IconButton>
        ) || props.toBeDeleted && (
          <IconButton onClick={() => props.deletion(props.user)}><UndoIcon/></IconButton>
        ) || (
          <IconButton onClick={() => props.deletion(props.user)}><DeleteIcon/></IconButton>
        )
        }</Grid>
        <Grid size="auto">
          <Box pt="4px"><Avatar {...stringAvatar(props.user.username)} /></Box>
        </Grid>
        <Grid size="grow">
          <ListItemText
            style={{ flexGrow: 1, width: "100%" }}
            primary={props.user.username}
            slotProps={{ primary: { noWrap: true } }}
          />
        </Grid>
      </Grid>
    </ListItem>
    );
}
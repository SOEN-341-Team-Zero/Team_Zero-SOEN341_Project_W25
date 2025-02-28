import { ListItem, ListItemText, IconButton, Box, Avatar, Grid2 as Grid } from "@mui/material";
import { useState } from "react";
import { IUserModel } from "../models/models";
import { useApplicationStore } from "../stores/ApplicationStore";
import { stringAvatar } from "../utils/AvatarUtils";
import MessageIcon from "@mui/icons-material/Send";
import UndoIcon from "@mui/icons-material/Undo";
import DeleteIcon from "@mui/icons-material/Delete";

interface IUserListItemProps {
  user: IUserModel;
  isHover: boolean;
  toBeDeleted: boolean;
  deletion: (user: IUserModel) => void;
}

export default function UserListItem(props: IUserListItemProps) {
  const applicationState = useApplicationStore();

  return (
    <ListItem
      className="user-item"
      key={props.user.user_id}
    >
      <Grid container spacing={1} alignItems="center">
        <Box pt="4px">
          <Avatar {...stringAvatar(props.user.username)} />
        </Box>
        <Grid container alignItems="center" size={12}>
          <ListItemText
            style={{ flexGrow: 1, width: "100%" }}
            primary={props.user.username}
            slotProps={{ primary: { noWrap: true } }}
          />
        </Grid>
        {props.isHover && (
          <IconButton><MessageIcon/></IconButton>
        ) || props.toBeDeleted && (
          <IconButton onClick={() => props.deletion(props.user)}><UndoIcon/></IconButton>
        ) || (
          <IconButton onClick={() => props.deletion(props.user)}><DeleteIcon/></IconButton>
        )
        }
      </Grid>
    </ListItem>
    );
}

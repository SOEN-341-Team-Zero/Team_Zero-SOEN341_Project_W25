import PersonAddIcon from "@mui/icons-material/PersonAdd";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";

import { useEffect, useState } from "react";

import { toast } from "react-toastify";
import wretch from "wretch";
import { useApplicationStore } from "../../stores/ApplicationStore";
import { API_URL } from "../../utils/FetchUtils";
import UserSearch, {
  UserSearchDialogSlotProps,
  UserSearchMode,
} from "../UserSearch/UserSearch";

import UserList from "../UserList";
import { IUserModel } from "../../models/models";

interface IInviteToChannelButtonProps {
  teamId: number;
  channelId: number;
  channelName: string;
  displayButton: boolean;
}

export default function InviteToChannelButton(
  props: IInviteToChannelButtonProps,
) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [inviteeNames, setInviteeNames] = useState<string[]>([]);
  const refetchData = useApplicationStore(
    (state) => state.refetchTeamChannelsState,
  );
  const [users, setUsers] = useState<IUserModel[]>([]);
  const [deletionList, setDeletionList] = useState<IUserModel[]>([]);
  const [key, setKey] = useState<number>(0);

  const buttonDisplay = props.displayButton ? "auto" : "none";

  useEffect(() => {
    if (isDialogOpen) {
      getChannelUsers();
    }
  }, [isDialogOpen]);

  const getChannelUsers = () => {
    wretch(`${API_URL}/api/add/sendallchannelusers`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .headers({ "Content-Type": "application/json" })
      .post(JSON.stringify(props.channelId))
      .json((data: { usernames: string[]; ids: number[] }) => {
        const { usernames, ids } = data;
        setUsers(
          usernames.map((name, i) => ({ username: name, user_id: ids[i] })),
        );
      })
      .catch((error) => {
        console.error(error);
        toast.error("An error has occurred.");
      });
  };

  const onSubmit = () => {
    if (inviteeNames.length + deletionList.length > 0) {
      wretch(`${API_URL}/api/add/addtochannel`)
        .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
        .post({
          team_id: props.teamId,
          channel_id: props.channelId,
          users_to_add: inviteeNames,
          users_to_delete: deletionList.map((u) => u.username),
        })
        .res(() => {
          refetchData();
          toast.success(
            "User" +
              (inviteeNames.length + deletionList.length > 1
                ? "s have"
                : " has") +
              " been updated successfully.",
          );

          setIsDialogOpen(false);
        })
        .catch((error) => {
          console.error(error);
          toast.error("An error has occurred.");
        });
    }
  };

  const quit = () => {
    setDeletionList([]);
    setUsers([]);
    setKey((prevKey) => prevKey + 1); // Resets the user list
    setIsDialogOpen(false);
  };

  return (
    <>
      <Dialog
        slotProps={UserSearchDialogSlotProps}
        open={isDialogOpen}
        onClose={quit}
      >
        <DialogTitle>Manage Users in {props.channelName}</DialogTitle>
        <DialogContent
          sx={{
            minHeight: "100px",
            justifyItems: "center",
            overflow: "hidden",
          }}
        >
          <UserSearch
            mode={UserSearchMode.AddToChannel}
            channelId={props.channelId}
            targetNames={inviteeNames}
            setTargetNames={setInviteeNames}
          />
          <Box width="100%" mt="16px">
            <UserList
              fullWidth
              key={key}
              users={users}
              isHover={false}
              update={setDeletionList}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={onSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Tooltip
        slotProps={{ transition: { timeout: 0 } }}
        sx={{ display: buttonDisplay }}
        title="Manage users in this channel"
      >
        <IconButton
          sx={{
            display: buttonDisplay,
            maxHeight: "24px",
            borderRadius: "4px",
          }}
          edge="end"
          onClick={() => setIsDialogOpen(true)}
        >
          <PersonAddIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}

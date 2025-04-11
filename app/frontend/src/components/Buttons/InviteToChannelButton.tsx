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

import { useEffect, useState, useRef } from "react";

import { toast } from "react-toastify";
import wretch from "wretch";
import { useApplicationStore } from "../../stores/ApplicationStore";
import { API_URL } from "../../utils/FetchUtils";
import UserSearch, {
  UserSearchDialogSlotProps,
  UserSearchMode,
} from "../UserSearch/UserSearch";

import { IUserModel, IChannelModel } from "../../models/models";
import UserList from "../UserList";
import { useUserStore } from "../../stores/UserStore";

interface IInviteToChannelButtonProps {
  teamId: number;
  channel: IChannelModel;
  displayButton: boolean;
}

export default function InviteToChannelButton(
  props: Readonly<IInviteToChannelButtonProps>,
) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [inviteeNames, setInviteeNames] = useState<string[]>([]);
  const refetchData = useApplicationStore(
    (state) => state.refetchTeamChannelsState,
  );
  const [users, setUsers] = useState<IUserModel[]>([]);
  const [deletionList, setDeletionList] = useState<IUserModel[]>([]);
  const [key, setKey] = useState<number>(0);

  const ref = useRef<HTMLInputElement | null>(null);

  const buttonDisplay = props.displayButton ? "auto" : "none";
  const [teamUsers, setTeamUsers] = useState<string[]>([]);

  const selectedTeamId = useApplicationStore((state) => state.selectedTeam?.team_id);
  const currentTeamId = props.teamId ?? selectedTeamId;  

  const selectedChannelId = useApplicationStore((state) => state.selectedChannel?.id);
  const currentChannelId = props.channel.id ?? selectedChannelId;

  const currentUser = useUserStore((state) => state.user);
  const currentTeam = useApplicationStore((state) => state.selectedTeam);

  useEffect(() => {
    if (
        ref.current?.checked &&
        (deletionList.length > 0 || teamUsers.length > inviteeNames.length)
        
    )
      ref.current.checked = false;
  }, [deletionList, inviteeNames]);

  useEffect(() => {
    if (isDialogOpen) {
      getChannelUsers();
      getTeamUsers();
    }
  }, [isDialogOpen]);

  const getTeamUsers = () => {
    wretch(
      `${API_URL}/api/add/sendteamusers?teamId=${currentTeamId}&channelId=${currentChannelId}`,
    )
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .get()
      .json((data) => {
        setTeamUsers(data);
      })
      .catch((error) => {
        console.error(error);
        toast.error("An error has occurred.");
      });
  };

  const getChannelUsers = () => {
    wretch(`${API_URL}/api/add/sendallchannelusers`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .headers({ "Content-Type": "application/json" })
      .post(JSON.stringify(props.channel.id))
      .json((data) => {
        const users: { user_id: number; username: string; activity: string }[] =
          data.users;
        setUsers(users);
      })
      .catch((error) => {
        console.error(error);
        toast.error("An error has occurred.");
      });
  };

  const onSubmit = () => {
    if (deletionList.length > 0) {
      wretch(`${API_URL}/api/add/addtochannel`)
        .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
        .post({
          team_id: props.teamId,
          channel_id: props.channel.id,
          users_to_add: [], // replaced by invite requests as of sprint 4 march 26th
          users_to_delete: deletionList.map((u) => u.username),
        })
        .res(() => {
          toast.success(
            "User" +
              (deletionList.length > 1 ? "s have" : " has") +
              " been removed successfully.",
          );
        })
        .catch((error) => {
          console.error(error);
          toast.error("An error has occurred.");
        });
    }

    if (inviteeNames.length > 0) {
      wretch(`${API_URL}/api/request/invite-by-names`)
        .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
        .post({
          team_id: props.teamId,
          channel_id: props.channel.id,
          requester_id: currentUser?.user_id,
          requester_name: currentUser?.username,
          channel_name: props.channel.channel_name,
          team_name: currentTeam?.team_name,
          users_to_invite: inviteeNames,
        })
        .json((data) => {
          toast.success(data.message);
        });
    }
    refetchData();
    quit();
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
        <DialogTitle>Manage Users in {props.channel.channel_name}</DialogTitle>
        <DialogContent
          sx={{
            minHeight: "100px",
            justifyItems: "center",
            overflow: "hidden",
          }}
        >
          <UserSearch
            mode={UserSearchMode.AddToChannel}
            channelId={props.channel.id}
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
              channel={props.channel}
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

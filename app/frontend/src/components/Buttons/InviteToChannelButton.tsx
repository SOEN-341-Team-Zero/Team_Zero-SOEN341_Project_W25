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
  FormControlLabel,
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

import { UserActivity, IUserModel } from "../../models/models";
import UserList from "../UserList";
import { useUserStore } from "../../stores/UserStore";

interface IInviteToChannelButtonProps {
  teamId: number;
  channelId: number;
  channelName: string;
  channelPub: boolean;
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

  const ref = useRef<HTMLInputElement | null>(null);

  const buttonDisplay = props.displayButton ? "auto" : "none";
  const [teamUsers, setTeamUsers] = useState<string[]>([]);

  const currentTeamId =
    props.teamId ?? useApplicationStore((state) => state.selectedTeam?.team_id);

  const currentChannelId =
    props.channelId ??
    useApplicationStore((state) => state.selectedTeam?.team_id);

  const currentUser = useUserStore((state) => state.user);
  const currentTeam = useApplicationStore((state) => state.selectedTeam);

  useEffect(() => {
    if (
      ref.current &&
      ref.current.checked &&
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
      .post(JSON.stringify(props.channelId))
      .json(
        (data: {
          usernames: string[];
          ids: number[];
          activities: UserActivity[];
        }) => {
          const { usernames, ids, activities } = data;
          setUsers(
            usernames.map((name, i) => ({
              username: name,
              user_id: ids[i],
              activity: activities[i],
            })),
          );
        },
      )
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
          channel_id: props.channelId,
          // users_to_add: inviteeNames, // replaced by invite requests as of sprint 4 march 26th
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
          channel_id: props.channelId,
          requester_id: currentUser?.user_id,
          requester_name: currentUser?.username,
          channel_name: props.channelName,
          team_name: currentTeam?.team_name,
          users_to_invite: inviteeNames,
        })
        .json((data) => {
          toast.success(data.message);
        });
    }
    refetchData();
    setIsDialogOpen(false);
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

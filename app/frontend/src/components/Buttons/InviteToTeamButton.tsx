import GroupAddIcon from "@mui/icons-material/GroupAdd";
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
import { UserActivity, IUserModel } from "../../models/models";
import { useApplicationStore } from "../../stores/ApplicationStore";
import { API_URL } from "../../utils/FetchUtils";
import UserList from "../UserList";
import UserSearch, {
  UserSearchDialogSlotProps,
  UserSearchMode,
} from "../UserSearch/UserSearch";

interface IInviteToTeamButtonProps {
  teamId: number;
  teamName: string;
}

export default function InviteToTeamButton(props: Readonly<IInviteToTeamButtonProps>) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [inviteeNames, setInviteeNames] = useState<string[]>([]);
  const refetchData = useApplicationStore(
    (state) => state.refetchTeamChannelsState,
  );
  const [users, setUsers] = useState<IUserModel[]>([]);
  const [deletionList, setDeletionList] = useState<IUserModel[]>([]);
  const [key, setKey] = useState<number>(0);

  useEffect(() => {
    if (isDialogOpen) {
      getTeamUsers();
    }
  }, [isDialogOpen]);

  const getTeamUsers = () => {
    wretch(`${API_URL}/api/add/sendallteamusers`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .headers({ "Content-Type": "application/json" })
      .post(JSON.stringify(props.teamId))
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
    if (inviteeNames.length + deletionList.length > 0) {
      wretch(`${API_URL}/api/add/addtoteam`)
        .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
        .post({
          team_id: props.teamId,
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
          getTeamUsers();
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
        <DialogTitle>Add Users to {props.teamName}</DialogTitle>
        <DialogContent
          sx={{
            minHeight: "100px",
            justifyItems: "center",
            overflow: "hidden",
          }}
        >
          <UserSearch
            teamId={props.teamId}
            mode={UserSearchMode.AddToTeam}
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
      <Tooltip title="Manage users in this team">
        <IconButton
          sx={{ height: "52px", width: "47%" }}
          onClick={() => setIsDialogOpen(true)}
        >
          <GroupAddIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}

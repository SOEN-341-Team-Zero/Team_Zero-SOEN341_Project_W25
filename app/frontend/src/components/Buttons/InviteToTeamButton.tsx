import GroupAddIcon from "@mui/icons-material/GroupAdd";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";

import { useState } from "react";

import { toast } from "react-toastify";
import wretch from "wretch";
import { useApplicationStore } from "../../stores/ApplicationStore";
import { API_URL } from "../../utils/FetchUtils";
import UserSearch, {
  UserSearchDialogSlotProps,
  UserSearchMode,
} from "../UserSearch/UserSearch";

interface IInviteToTeamButtonProps {
  teamId: number;
  teamName: string;
}

export default function InviteToTeamButton(props: IInviteToTeamButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [inviteeNames, setInviteeNames] = useState<string[]>([]);
  const refetchData = useApplicationStore(
    (state) => state.refetchTeamChannelsState,
  );

  const onSubmit = () => {
    if (inviteeNames.length > 0) {
      wretch(`${API_URL}/api/add/addtoteam`)
        .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
        .post({ team_id: props.teamId, users_to_add: inviteeNames })
        .res(() => {
          refetchData();
          toast.success(
            "User" +
              (inviteeNames.length > 1 ? "s have" : " has") +
              " been added successfully.",
          );
          setIsDialogOpen(false);
        })
        .catch((error) => {
          console.error(error);
          toast.error("An error has occurred.");
        });
    }
  };

  return (
    <>
      <Dialog
        slotProps={UserSearchDialogSlotProps}
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
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
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={onSubmit}>
            Invite
          </Button>
        </DialogActions>
      </Dialog>
      <Tooltip title="Assign users to the team">
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

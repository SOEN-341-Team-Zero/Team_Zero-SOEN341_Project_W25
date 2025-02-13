import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import GroupAddIcon from "@mui/icons-material/GroupAdd";

import { useState } from "react";

import wretch from "wretch";
import { toast } from "react-toastify";
import { useApplicationStore } from "../stores/ApplicationStore";

interface IInviteToTeamButtonProps {
  teamId: number;
  teamName: string;
}

export default function InviteToTeamButton(props: IInviteToTeamButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [inviteeNames, setInviteeNames] = useState<string[]>([]);
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const refetchData = useApplicationStore(
    (state) => state.refetchApplicationState,
  );

  const onSubmit = () => {
    if (inviteeNames.length > 0) {
      wretch(`http://localhost:3001/api/add/addtoteam`)
        .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
        .post({ team_id: props.teamId, users_to_add: inviteeNames })
        .res(() => {
          setIsDialogOpen(false);
          refetchData();
          toast.success("User(s) have been added successfully.");
        })
        .catch((error) => {
          console.error(error);
          toast.error("An error has occurred.");
        });
    }
  };
  return (
    <>
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Add users to {props.teamName}</DialogTitle>
        <DialogContent
          sx={{
            minHeight: "100px",
            alignContent: "center",
          }}
        >
          <TextField
            label={"Username"}
            title={"user_name"}
            value={currentUserName}
            onChange={(e) => {
              setCurrentUserName(e.target.value);

              // temporary, will need to do multiselect later
              setInviteeNames([e.target.value]);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={onSubmit}>
            Invite
          </Button>
        </DialogActions>
      </Dialog>{" "}
      <Tooltip title="Add users to the team">
        <IconButton
          sx={{ height: "52px", width: "47%" }}
          onClick={() => setIsDialogOpen(true)}
        >
          <GroupAddIcon></GroupAddIcon>
        </IconButton>
      </Tooltip>
    </>
  );
}

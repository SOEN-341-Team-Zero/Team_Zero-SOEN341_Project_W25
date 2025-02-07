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
import PersonAddIcon from "@mui/icons-material/PersonAdd";

import { useState } from "react";

import wretch from "wretch";
import { toast } from "react-toastify";

interface IInviteToChannelButtonProps {
  teamId: number;
  channelId: number;
  channelName: string;
  refetchData: () => void;
}

export default function InviteToChannelButton(
  props: IInviteToChannelButtonProps,
) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [inviteeNames, setInviteeNames] = useState<string[]>([]);
  const [currentUserName, setCurrentUserName] = useState<string>("");

  const onSubmit = () => {
    if (inviteeNames.length > 0) {
      wretch(`http://localhost:3001/api/add/addtochannel`)
        .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
        .post({
          team_id: props.teamId,
          channel_id: props.channelId,
          users_to_add: inviteeNames,
        })
        .res(() => {
          setIsDialogOpen(false);
          props.refetchData();
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
        <DialogTitle>Add users to {props.channelName}</DialogTitle>
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
      </Dialog>
      <Tooltip title="Assign users to this channel">
        <IconButton
          sx={{ maxHeight: "24px", borderRadius: "4px" }}
          edge="end"
          onClick={() => setIsDialogOpen(true)}
        >
          <PersonAddIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}

import PersonAddIcon from "@mui/icons-material/PersonAdd";
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

  const buttonDisplay = props.displayButton ? "auto" : "none";

  const onSubmit = () => {
    if (inviteeNames.length > 0) {
      wretch(`${API_URL}/api/add/addtochannel`)
        .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
        .post({
          team_id: props.teamId,
          channel_id: props.channelId,
          users_to_add: inviteeNames,
        })
        .res(() => {
          refetchData();
          toast.success(
            inviteeNames.length +
              " User" +
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
        <DialogTitle>Add Users to {props.channelName}</DialogTitle>
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
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={onSubmit}>
            Invite
          </Button>
        </DialogActions>
      </Dialog>
      <Tooltip
        slotProps={{ transition: { timeout: 0 } }}
        sx={{ display: buttonDisplay }}
        title="Assign users to this channel"
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

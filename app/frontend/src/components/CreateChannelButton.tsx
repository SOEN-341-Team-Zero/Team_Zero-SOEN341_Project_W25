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
import AddIcon from "@mui/icons-material/Add";

import { useState } from "react";

import wretch from "wretch";
import { toast } from "react-toastify";
import { useApplicationStore } from "../stores/ApplicationStore";
import { API_URL } from "../utils/FetchUtils";

interface ICreateChannelButtonProps {
  teamId: number;
}

export default function CreateChannelButton(props: ICreateChannelButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [channelName, setChannelName] = useState<string>("");

  const refetchData = useApplicationStore(
    (state) => state.refetchTeamChannelsState,
  );

  const onSubmit = () => {
    if (channelName) {
      wretch(`${API_URL}/api/create/channel`)
        .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
        .post({ team_id: props.teamId, channel_name: channelName })
        .res(() => {
          setIsDialogOpen(false);
          refetchData();
          toast.success("Team created successfully!");
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
        <DialogTitle>Create a Channel</DialogTitle>
        <DialogContent
          sx={{
            minHeight: "100px",
            alignContent: "center",
          }}
        >
          <TextField
            label={"Channel Name"}
            title={"channel_name"}
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={onSubmit}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
      <Tooltip title="Create a channel">
        <IconButton
          sx={{ height: "52px", width: "47%" }}
          onClick={() => setIsDialogOpen(true)}
        >
          <AddIcon></AddIcon>
        </IconButton>
      </Tooltip>
    </>
  );
}

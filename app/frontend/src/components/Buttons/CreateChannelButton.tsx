import AddIcon from "@mui/icons-material/Add";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  FormControlLabel,
  Box
} from "@mui/material";

import { useState } from "react";

import { toast } from "react-toastify";
import wretch from "wretch";
import { useApplicationStore } from "../../stores/ApplicationStore";
import { useUserStore } from "../../stores/UserStore";
import { API_URL } from "../../utils/FetchUtils";

interface ICreateChannelButtonProps {teamId: number;}

export default function CreateChannelButton(props: ICreateChannelButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [channelName, setChannelName] = useState<string>("");
  const userState = useUserStore();
  const [pubb, setPubb] = useState<boolean>(userState.isUserAdmin && props.teamId == 0);

  const refetchData = useApplicationStore(
    (state) => state.refetchTeamChannelsState,
  );

  const onSubmit = () => {
    if (channelName) {
      wretch(`${API_URL}/api/create/channel`)
        .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
        .post({ team_id: props.teamId, channel_name: channelName, pub: pubb })
        .res(() => {
          setIsDialogOpen(false);
          refetchData();
          toast.success("Channel created successfully!");
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
          {props.teamId == 0 && userState.isUserAdmin &&  <Box sx={{
    display: "flex",
    justifyContent: "center",
  }}><FormControlLabel
                                control={<input type="checkbox" value="checked" onChange={() => {setPubb(!pubb);}} />}
                                label="Public"
                                sx={{ "& .MuiFormControlLabel-label": { marginLeft: "8px" } }}
                              /></Box>}
                              <br/>
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
          sx={{ height: "52px", width: props.teamId === 0 ? "100%" : "47%"}}
          onClick={() => setIsDialogOpen(true)}
        >
          <AddIcon></AddIcon>
        </IconButton>
      </Tooltip>
    </>
  );
}

import {
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";

import wretch from "wretch";
import { toast } from "react-toastify";
import { useApplicationStore } from "../../stores/ApplicationStore";
import { API_URL } from "../../utils/FetchUtils";

interface ICreateTeamButtonProps {}

export default function CreateTeamButton(props: ICreateTeamButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [teamName, setTeamName] = useState<string>("");

  const refetchData = useApplicationStore(
    (state) => state.refetchTeamChannelsState,
  );

  const onSubmit = () => {
    if (teamName) {
      wretch(`${API_URL}/api/create/team`)
        .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
        .post({ team_name: teamName })
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
        <DialogTitle>Create a team</DialogTitle>
        <DialogContent
          sx={{
            minHeight: "100px",
            alignContent: "center",
          }}
        >
          <TextField
            label={"Team Name"}
            title={"team_name"}
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={onSubmit}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
      <Tooltip placement="right" title="Create a new team">
        <IconButton onClick={() => setIsDialogOpen(true)}>
          <AddIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}

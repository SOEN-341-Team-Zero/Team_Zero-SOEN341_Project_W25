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

interface ICreateTeamButtonProps {
  refetchData: () => void;
}

export default function CreateTeamButton(props: ICreateTeamButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [teamName, setTeamName] = useState<string>("");

  const onSubmit = () => {
    console.log(teamName);
    if (teamName) {
      wretch(`http://localhost:3001/api/create/team`)
        .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
        .post({ team_name: teamName })
        .res(() => {
          setIsDialogOpen(false);
          props.refetchData();
        })
        .catch((error) => {
          console.error(error);
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

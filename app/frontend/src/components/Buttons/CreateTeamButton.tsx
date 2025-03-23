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
} from "@mui/material";
import { useState } from "react";

import { toast } from "react-toastify";
import wretch from "wretch";
import { useApplicationStore, ViewModes } from "../../stores/ApplicationStore";
import { API_URL } from "../../utils/FetchUtils";
import { ITeamModel } from "../../models/models";

interface ICreateTeamButtonProps {}

export default function CreateTeamButton(props: ICreateTeamButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [teamName, setTeamName] = useState<string>("");
  
  const refetchData = useApplicationStore(
    (state) => state.refetchTeamChannelsState
  );
  
  const createDefaultChannel = async (teamId: number) => {
    const defaultChannelName = "General"; 
    try {
      await wretch(`${API_URL}/api/create/channel`)
        .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
        .post({ team_id: teamId, channel_name: defaultChannelName })
        .res();  
      toast.success("Default channel created successfully!");
      refetchData();
    } catch (error) {
      toast.error("An error occurred while creating the default channel.");
    }
  };
  
  const applicationState = useApplicationStore();
  const handleTeamSelected = (team: ITeamModel) => {
    applicationState.setViewMode(ViewModes.Team);
    applicationState.setSelectedTeam(team);
    refetchData();
  }
  const onSubmit = () => {
    if (teamName) {
      wretch(`${API_URL}/api/create/team`)
        .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
        .post({ team_name: teamName })
        .json()  
        .then((response:any) => {
          const teamId = response.teamId;  
          if (teamId !== undefined) {
            setIsDialogOpen(false);
            toast.success("Team created successfully!");
            refetchData();
            createDefaultChannel(teamId);
            const newTeam: ITeamModel = {
              team_id: teamId,
              team_name: teamName,
              channels: [], 
            };
            handleTeamSelected(newTeam);
          } else {
            toast.error("An error occurred while creating the team.");
          }
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
        <IconButton onClick={() => setIsDialogOpen(true)} data-testid="sidebar-create-team-button">
          <AddIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}
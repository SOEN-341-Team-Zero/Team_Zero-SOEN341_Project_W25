import { Box, Typography, Button } from "@mui/material";
import wretch from "wretch";
import SendIcon from "@mui/icons-material/Send";
import { API_URL } from "../../utils/FetchUtils";
import { toast } from "react-toastify";
import { useUserStore } from "../../stores/UserStore";
import { useApplicationStore } from "../../stores/ApplicationStore";
import { IRequestModel } from "../../models/models";

export default function RequestCreationPrompt() {
  const currentUser = useUserStore((state) => state.user);
  const selectedChannel = useApplicationStore((state) => state.selectedChannel);
  const selectedTeam = useApplicationStore((state) => state.selectedTeam);

  const requestAccess = () => {
    // request object to be sent to the backend

    if (
      !currentUser ||
      !selectedChannel ||
      !selectedTeam ||
      !selectedChannel.owner_id
    )
      return;

    const request: IRequestModel = {
      request_id: 0, // doesn't actually matter, this is determined in the backend but needs to be defined to respect IRequestModel

      requester_id: currentUser?.user_id,
      requester_name: currentUser?.username,
      channel_id: selectedChannel?.id,
      channel_name: selectedChannel?.channel_name,
      team_name: selectedTeam?.team_name,
      recipient_id: selectedChannel?.owner_id,
      request_type: "join",
      created_at: new Date().toISOString(),
    };

    wretch(`${API_URL}/api/request/join`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .post(request)
      .res(() => {
        toast.success("Request sent successfully!");
      })
      .catch((error) => {
        console.error(error);
        toast.error("An error has occurred.");
      });
  };

  return (
    <Box sx={{ textAlign: "center", mt: 2 }}>
      <Typography variant="h6" mb={2}>
        You do not have permission to access this channel.
      </Typography>
      <Typography variant="body1" mb={2}>
        Would you like to request access to this channel?
      </Typography>

      <Button variant={"contained"} sx={{ p: 1.2 }} onClick={requestAccess}>
        Request access
        <SendIcon sx={{ ml: 2 }} />
      </Button>
    </Box>
  );
}

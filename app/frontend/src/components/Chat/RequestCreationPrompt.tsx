import { Box, Typography, Button, IconButton } from "@mui/material";
import wretch from "wretch";
import SendIcon from "@mui/icons-material/Send";
import { API_URL } from "../../utils/FetchUtils";
import { toast } from "react-toastify";
import { useUserStore } from "../../stores/UserStore";
import { useApplicationStore } from "../../stores/ApplicationStore";
import { IRequestModel } from "../../models/models";
import { useEffect, useState } from "react";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

interface RequestCreationPromptProps {
  fetchMessages: () => Promise<void>;
}

export default function RequestCreationPrompt(
  props: RequestCreationPromptProps,
) {
  const currentUser = useUserStore((state) => state.user);
  const selectedChannel = useApplicationStore((state) => state.selectedChannel);
  const selectedTeam = useApplicationStore((state) => state.selectedTeam);

  const [requestExists, setRequestExists] = useState<boolean>(true);
  const [existingRequestId, setExistingRequestId] = useState<number>(-1);
  const [existingRequestType, setExistingRequestType] = useState<string>("");
  const [isFetchingRequestStatus, setIsFetchingRequestStatus] =
    useState<boolean>(false);

  const checkIfRequestExists = () => {
    setIsFetchingRequestStatus(true);
    wretch(`${API_URL}/api/request/exists?channel_id=${selectedChannel?.id}`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .get()
      .json((data) => {
        setRequestExists(data.exists);
        if (data.exists) {
          setExistingRequestType(data.type);
          setExistingRequestId(data.request_id);
        }
        setIsFetchingRequestStatus(false);
      });
  };

  const answerInviteRequest = (accept: boolean) => {
    wretch(`${API_URL}/api/request/answer-request`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .post({ request_id: existingRequestId, accept: accept })
      .res((response) => {
        if (response.ok) {
          toast.success(
            `Request ${accept ? "accepted" : "declined"} successfully.`,
          );
          props.fetchMessages();
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("An error has occurred.");
      });
  };

  useEffect(() => {
    checkIfRequestExists();
  }, []);
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

  const secondaryText = requestExists
    ? existingRequestType === "join"
      ? "A request to join has already been sent to the channel owner."
      : "The channel owner has invited you to join this channel."
    : "Would you like to request access to this channel?";

  return (
    <Box sx={{ textAlign: "center", mt: 2 }}>
      <Typography variant="h6" mb={2}>
        You do not have permission to access this channel.
      </Typography>

      {!isFetchingRequestStatus && (
        <Box>
          <Typography variant="body1" mb={2}>
            {secondaryText}
          </Typography>

          {!requestExists && (
            <Button
              variant={"contained"}
              sx={{ p: 1.2 }}
              onClick={requestAccess}
            >
              Request access
              <SendIcon sx={{ ml: 2 }} />
            </Button>
          )}

          {existingRequestType == "invite" && (
            <Box>
              <IconButton
                color="success"
                onClick={() => answerInviteRequest(true)}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => answerInviteRequest(false)}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

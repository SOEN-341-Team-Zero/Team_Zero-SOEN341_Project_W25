import { Box, IconButton, List, Typography } from "@mui/material";
import { IChannelRequestModel } from "../../models/models";
import RequestsListItem from "./RequestsListItem";
import "../../styles/Requests.css";
import wretch from "wretch";

import RefreshIcon from "@mui/icons-material/Refresh";
import { API_URL } from "../../utils/FetchUtils";
import { toast } from "react-toastify";

interface RequestsListProps {
  requests: IChannelRequestModel[];
  setRequests: (requests: IChannelRequestModel[]) => void;
  refetchRequests?: () => void;
}

export default function RequestsList(props: RequestsListProps) {
  const handleAction = (request_id: number, isAccept: boolean) => {
    wretch(`${API_URL}/api/request/answer-request`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .post({ request_id: request_id, accept: isAccept })
      .res((response) => {
        if (response.ok) {
          toast.success(
            `Request ${isAccept ? "accepted" : "declined"} successfully.`,
          );
          props.setRequests(
            props.requests.filter(
              (request) => request.request_id !== request_id,
            ),
          );
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("An error has occurred.");
      });
  };

  return (
    <Box maxHeight="88vh" overflow={"hidden"} mt={1}>
      {props.requests.length > 0 && (
        <List
          className="request-list"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            maxHeight: "88vh",
            overflowY: "scroll",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#899483",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#5F6959",
            },
          }}
          disablePadding
        >
          {props.requests.map((request) => (
            <RequestsListItem
              handleAction={handleAction}
              request={request}
              key={request.request_id}
            />
          ))}
        </List>
      )}

      {props.requests.length === 0 && (
        <Box>
          <Typography>
            You do not have any pending requests at the moment.
          </Typography>
          <IconButton onClick={props.refetchRequests}>
            <RefreshIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}

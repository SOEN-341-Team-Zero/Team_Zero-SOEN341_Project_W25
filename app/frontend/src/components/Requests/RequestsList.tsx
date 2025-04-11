import {
  Box,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListSubheader,
  Typography,
} from "@mui/material";
import { IRequestModel } from "../../models/models";
import RequestsListItem from "./RequestsListItem";
import "../../styles/Requests.css";
import wretch from "wretch";

import RefreshIcon from "@mui/icons-material/Refresh";
import { API_URL } from "../../utils/FetchUtils";
import { toast } from "react-toastify";
import { isMobile } from "../../utils/BrowserUtils";

interface RequestsListProps {
  requests: IRequestModel[];
  setRequests: (requests: IRequestModel[]) => void;
  refetchRequests?: () => void;
  isFetching?: boolean;
}

export default function RequestsList(props: Readonly<RequestsListProps>) {
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

  const joinRequests = props.requests.filter(
    (request) => request.request_type == "join",
  );
  const inviteRequests = props.requests.filter(
    (request) => request.request_type == "invite",
  );

  const isUserMobile = isMobile();

  return (
    <Box maxHeight="88vh" overflow={"hidden"} mt={1}>
      {props.isFetching && (
        <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
          <CircularProgress />
        </Box>
      )}
      <List
        className="request-list"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          maxHeight: isUserMobile? "40vh" : "88vh",
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
        {joinRequests.length > 0 && (
          <ListItem disablePadding>
            <List
              sx={{
                width: "100%",
                gap: 1,
                display: "flex",
                flexDirection: "column",
              }}
              disablePadding
            >
              <ListSubheader>Join Requests</ListSubheader>
              {joinRequests.map((request) => (
                <RequestsListItem
                  handleAction={handleAction}
                  request={request}
                  key={request.request_id}
                />
              ))}
            </List>
          </ListItem>
        )}
        {inviteRequests.length > 0 && (
          <ListItem disablePadding>
            <List
              sx={{
                width: "100%",
                gap: 1,
                display: "flex",
                flexDirection: "column",
              }}
              disablePadding
            >
              <ListSubheader>Invite Requests</ListSubheader>
              {inviteRequests.map((request) => (
                <RequestsListItem
                  handleAction={handleAction}
                  request={request}
                  key={request.request_id}
                />
              ))}
            </List>
          </ListItem>
        )}
      </List>

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

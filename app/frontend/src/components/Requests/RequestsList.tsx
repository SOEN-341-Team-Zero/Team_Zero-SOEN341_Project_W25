import { Box, IconButton, List, Typography } from "@mui/material";
import { IChannelRequestModel } from "../../models/models";
import RequestsListItem from "./RequestsListItem";
import "../../styles/Requests.css";

import RefreshIcon from "@mui/icons-material/Refresh";

interface RequestsListProps {
  requests: IChannelRequestModel[];
  refetchRequests?: () => void;
}

export default function RequestsList(props: RequestsListProps) {
  return (
    <Box maxHeight="88vh" overflow={"hidden"} mt={1} >
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
            <RequestsListItem request={request} key={request.request_id} />
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

import {
  ListItem,
  Grid2 as Grid,
  Avatar,
  ListItemText,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { IRequestModel } from "../../models/models";
import { stringAvatar } from "../../utils/AvatarUtils";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

interface RequestsListItemProps {
  request: IRequestModel;
  handleAction: (request_id: number, isAccept: boolean) => void;
}

export default function RequestsListItem(props: RequestsListItemProps) {
  const accept = () => {
    props.handleAction(props.request.request_id, true);
  };

  const decline = () => {
    props.handleAction(props.request.request_id, false);
  };

  return (
    <ListItem
      className="request-list-item"
      sx={{ justifyContent: "space-between" }}
    >
      <Grid container width="100%" columnSpacing={1}>
        <Grid container size={"grow"} columnSpacing={2}>
          <Avatar {...stringAvatar(props.request.requester_name)} />
          <Grid size="grow" alignContent={"center"}>
            <Typography display="inline">
              {props.request.requester_name +
                " wants to join " +
                props.request.channel_name}
            </Typography>

            {props.request.team_name && (
              <Typography display="inline" color="secondary">
                {" in " + props.request.team_name}
              </Typography>
            )}
          </Grid>
        </Grid>
        <Grid container size={"auto"} columnSpacing={1}>
          <IconButton color="success" onClick={accept}>
            <CheckIcon />
          </IconButton>
          <IconButton color="error" onClick={decline}>
            <CloseIcon />
          </IconButton>
        </Grid>
      </Grid>
    </ListItem>
  );
}

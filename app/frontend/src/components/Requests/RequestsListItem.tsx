import {
  Avatar,
  Grid2 as Grid,
  IconButton,
  ListItem,
  Typography,
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

  const primaryText =
    props.request.requester_name +
    (props.request.request_type == "join"
      ? " wants to join "
      : " is inviting you to join ") +
    '"' +
    props.request.channel_name +
    '"';

  return (
    <ListItem
      className="request-list-item"
      sx={{ justifyContent: "space-between" }}
    >
      <Grid container width="100%" columnSpacing={1}>
        <Grid container size={"grow"} columnSpacing={2}>
          <Avatar {...stringAvatar(props.request.requester_name)} />
          <Grid size="grow" alignContent={"center"}>
            <Typography display="inline">{primaryText}</Typography>

            {props.request.team_name && (
              <Typography display="inline" color="secondary">
                {" in " + props.request.team_name}
              </Typography>
            )}
          </Grid>
        </Grid>
        <Grid container size={"auto"} columnSpacing={1}>
          <IconButton
            color="success"
            onClick={accept}
            sx={{ height: "40px", width: "40px" }}
          >
            <CheckIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={decline}
            sx={{ height: "40px", width: "40px" }}
          >
            <CloseIcon />
          </IconButton>
        </Grid>
      </Grid>
    </ListItem>
  );
}

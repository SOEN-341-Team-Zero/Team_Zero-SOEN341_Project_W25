import {
  Avatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { cloneElement, ReactElement } from "react";
import { IStoryUserModel, useStoryStore } from "../../stores/StoryStore";
import { stringAvatar } from "../../utils/AvatarUtils";

interface CarouselItemProps {
  user: IStoryUserModel;
  badge?: ReactElement;
}

export default function CarouselItem(props: Readonly<CarouselItemProps>) {
  const setSelectedStoryUser = useStoryStore(
    (state) => state.setSelectedStoryUser,
  );

  const handleItemClick = () => {
    setSelectedStoryUser(props.user);
  };

  return (
    <ListItemButton
      key={props.user.user_id}
      sx={{
        flexDirection: "column",
        alignItems: "center",
        "&:hover": { backgroundColor: "transparent" },
        width: "78px",
        minWidth: "78px",
        pb: 0,
      }}
      onClick={handleItemClick}
      disableGutters
      disableRipple
    >
      {props.badge ? (
        cloneElement(props.badge, {
          children: (
            <Avatar
              {...stringAvatar(props.user.username || "You", {
                width: "52px",
                height: "52px",
                border: "2px solid #00000020",
              })}
            />
          ),
        })
      ) : (
        <Avatar
          {...stringAvatar(props.user.username || "You", {
            width: "52px",
            height: "52px",
            border: "2px solid #00000020",
          })}
        />
      )}

      <ListItemText
        primary={
          <Typography
            fontSize={14}
            sx={{
              textAlign: "center",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              maxWidth: "78px",
            }}
          >
            {props.user.username}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

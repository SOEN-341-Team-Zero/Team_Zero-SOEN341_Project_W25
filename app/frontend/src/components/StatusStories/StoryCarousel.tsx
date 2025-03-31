import {
  Avatar,
  Grid2 as Grid,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import "../../styles/Stories.css";
import { stringAvatar } from "../../utils/AvatarUtils";
import { useUserStore } from "../../stores/UserStore";
import CarouselItem from "./CarouselItem";
import { IUserModel, UserActivity } from "../../models/models";
import { useState } from "react";
import CreateStoryButton from "./CreateStoryButton";

const temporaryUserList: IUserModel[] = [
  {
    user_id: 1,
    username: "Alice",
    activity: UserActivity.Online,
  },
  {
    user_id: 2,
    username: "Bob",
    activity: UserActivity.Offline,
  },
  {
    user_id: 3,
    username: "Charlie",
    activity: UserActivity.Away,
  },
  {
    user_id: 4,
    username: "David",
    activity: UserActivity.Online,
  },
  {
    user_id: 5,
    username: "Eve",
    activity: UserActivity.Offline,
  },
  {
    user_id: 6,
    username: "Frank",
    activity: UserActivity.Away,
  },
  {
    user_id: 7,
    username: "Grace",
    activity: UserActivity.Online,
  },
  {
    user_id: 8,
    username: "Hank",
    activity: UserActivity.Offline,
  },
  {
    user_id: 9,
    username: "Ivy",
    activity: UserActivity.Away,
  },
  {
    user_id: 10,
    username: "Jack",
    activity: UserActivity.Online,
  },
  {
    user_id: 11,
    username: "Karen",
    activity: UserActivity.Offline,
  },
  {
    user_id: 12,
    username: "Leo",
    activity: UserActivity.Away,
  },
  {
    user_id: 13,
    username: "Mia",
    activity: UserActivity.Online,
  },
  {
    user_id: 14,
    username: "Nina",
    activity: UserActivity.Offline,
  },
  {
    user_id: 15,
    username: "Oscar",
    activity: UserActivity.Away,
  },
  {
    user_id: 16,
    username: "Paul",
    activity: UserActivity.Online,
  },
  {
    user_id: 17,
    username: "Quinn",
    activity: UserActivity.Offline,
  },
  {
    user_id: 18,
    username: "Rachel",
    activity: UserActivity.Away,
  },
  {
    user_id: 19,
    username: "Steve",
    activity: UserActivity.Online,
  },
  {
    user_id: 20,
    username: "Tina",
    activity: UserActivity.Offline,
  },
];

export default function StoryCarousel() {
  const [users, setUsers] = useState<IUserModel[]>(temporaryUserList); // all ChatHaven users that have stories

  return (
    <Grid
      className="stories-carousel-bar"
      my={2}
      py={1.5}
      maxWidth={"100%"}
      sx={{ display: "flex", alignItems: "center" }}
    >
      <List
        sx={{
          display: "flex",
          flexDirection: "row", 
          gap: 1,
          maxWidth: "100%",
          overflowX: "auto",
          whiteSpace: "nowrap", // Prevent items from wrapping
          pb: 0,
          "&::-webkit-scrollbar": {
            height: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#899483",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#5F6959",
          },
        }}
      >
        <CreateStoryButton />
        {users.map((user) => (
          <CarouselItem key={user.user_id} user={user} />
        ))}
      </List>
    </Grid>
  );
}

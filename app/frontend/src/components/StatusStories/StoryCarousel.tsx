import { Grid2 as Grid, List } from "@mui/material";
import { useEffect, useState } from "react";
import { IStoryUserModel, useStoryStore } from "../../stores/StoryStore";
import "../../styles/Stories.css";
import CarouselItem from "./CarouselItem";
import CreateStoryButton from "./CreateStoryButton";

const temporaryUserList: { user_id: number; username: string }[] = [
  {
    user_id: 1,
    username: "Alice",
  },
  {
    user_id: 2,
    username: "Bob",
  },
  {
    user_id: 3,
    username: "Charlie",
  },
  {
    user_id: 4,
    username: "David",
  },
  {
    user_id: 5,
    username: "Eve",
  },
  {
    user_id: 6,
    username: "Frank",
  },
  {
    user_id: 7,
    username: "Grace",
  },
  {
    user_id: 8,
    username: "Hank",
  },
  {
    user_id: 9,
    username: "Ivy",
  },
  {
    user_id: 10,
    username: "Jack",
  },
  {
    user_id: 11,
    username: "Karen",
  },
  {
    user_id: 12,
    username: "Leo",
  },
  {
    user_id: 13,
    username: "Mia",
  },
  {
    user_id: 14,
    username: "Nina",
  },
  {
    user_id: 15,
    username: "Oscar",
  },
  {
    user_id: 16,
    username: "Paul",
  },
  {
    user_id: 17,
    username: "Quinn",
  },
  {
    user_id: 18,
    username: "Rachel",
  },
  {
    user_id: 19,
    username: "Steve",
  },
  {
    user_id: 20,
    username: "Tina",
  },
];

export default function StoryCarousel() {
  const [usersWithStories, setUsersWithStories] =
    useState<IStoryUserModel[]>(temporaryUserList); // all ChatHaven users that have stories

  const stories = useStoryStore((state) => state.stories);

  const getUsersWithStories = () => {
    if (!stories) return [];

    const uniqueUsersWithStories: IStoryUserModel[] = [];

    const usersWithStories = stories.forEach((story) => {
      if (uniqueUsersWithStories.some((user) => user.user_id === story.user_id))
        return;

      uniqueUsersWithStories.push({
        user_id: story.user_id,
        username: story.username,
      });
    });

    return uniqueUsersWithStories;
  };

  useEffect(() => {
    setUsersWithStories(getUsersWithStories());
  }, [stories]);

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
        {usersWithStories.map((user) => (
          <CarouselItem key={user.user_id} user={user} />
        ))}
      </List>
    </Grid>
  );
}

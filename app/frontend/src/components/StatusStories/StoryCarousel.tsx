import { Grid2 as Grid, List } from "@mui/material";
import { useEffect, useState } from "react";
import { IStoryUserModel, useStoryStore } from "../../stores/StoryStore";
import { useUserStore } from "../../stores/UserStore";
import "../../styles/Stories.css";
import CarouselItem from "./CarouselItem";
import CreateStoryButton from "./CreateStoryButton";

interface StoryCarouselProps {
  refetchStories: () => void;
}

export default function StoryCarousel(props: StoryCarouselProps) {
  const [usersWithStories, setUsersWithStories] = useState<IStoryUserModel[]>(
    [],
  ); // all ChatHaven users that have stories

  const currentUserId = useUserStore((state) => state.user?.user_id) ?? -1; // current user id
  const stories = useStoryStore((state) => state.stories);

  const getUsersWithStories = () => {
    if (!stories) return [];

    const uniqueUsersWithStories = stories.reduce<IStoryUserModel[]>(
      (acc, story) => {
        if (
          !acc.some((user) => user.user_id === story.user_id) &&
          story.user_id !== currentUserId
        ) {
          acc.push({ user_id: story.user_id, username: story.username });
        }
        return acc;
      },
      [],
    );

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
        <CreateStoryButton refetchStories={props.refetchStories} />
        {usersWithStories.map((user) => (
          <CarouselItem key={user.user_id} user={user} />
        ))}
      </List>
    </Grid>
  );
}

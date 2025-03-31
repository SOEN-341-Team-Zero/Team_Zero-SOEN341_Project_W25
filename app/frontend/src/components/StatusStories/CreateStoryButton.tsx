import { Box, Button, ListItemButton } from "@mui/material";
import CarouselItem from "./CarouselItem";
import { UserActivity } from "../../models/models";
import { useUserStore } from "../../stores/UserStore";
import CreateBadge from "../Badges/CreateBadge";

export default function CreateStoryButton() {
  const currentUser = useUserStore((state) => state.user) ?? {
    user_id: 0,
    username: "You",
    activity: UserActivity.Online,
  };

  const handleCreateClicked = () => {};

  return (
    <Box onClick={handleCreateClicked}>
      <CarouselItem user={currentUser} badge={<CreateBadge />} />
    </Box>
  );
}

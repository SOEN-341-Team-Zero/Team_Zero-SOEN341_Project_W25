import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { UserActivity } from "../../models/models";
import { useUserStore } from "../../stores/UserStore";
import CreateBadge from "../Badges/CreateBadge";
import CarouselItem from "./CarouselItem";

export default function CreateStoryButton() {
  const currentUser = useUserStore((state) => state.user) ?? {
    user_id: 0,
    username: "You",
    activity: UserActivity.Online,
  };

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDialogClose = () => {
    setFile(null);
    setIsDialogOpen(false);
  };
  const onSubmit = () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", currentUser.user_id.toString());

    setFile(null);
  };

  return (
    <>
      <Dialog
        slotProps={{ paper: { sx: { minWidth: "400px" } } }}
        open={isDialogOpen}
        onClose={handleDialogClose}
      >
        <DialogTitle>{`Post a new story`}</DialogTitle>
        <DialogContent
          sx={{
            minHeight: "100px",
            alignContent: "center",
            justifyItems: "center",
          }}
        >
          <Box
            sx={{
              alignContent: "center",
              justifyItems: "center",
            }}
          >
            <Button
              component="label"
              variant="contained"
              tabIndex={-1}
              startIcon={<CloudUploadIcon />}
            >
              Upload files
              <Input
                type="file"
                inputProps={{ accept: "image/*, video/*" }}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  console.log(event.target.files);
                  setFile(event.target.files?.[0] ?? null);
                }}
                style={{ display: "none" }}
              />
            </Button>
            <Typography mt={1}>{file ? file.name : ""}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button disabled={!file} variant="contained" onClick={onSubmit}>
            Post story
          </Button>
        </DialogActions>
      </Dialog>
      <Box>
        <CarouselItem
          user={currentUser}
          badge={
            <CreateBadge handleCreateClicked={() => setIsDialogOpen(true)} />
          }
        />
      </Box>
    </>
  );
}

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
import { toast } from "react-toastify";
import wretch from "wretch";
import { UserActivity } from "../../models/models";
import { useUserStore } from "../../stores/UserStore";
import { API_URL } from "../../utils/FetchUtils";
import CreateBadge from "../Badges/CreateBadge";
import CarouselItem from "./CarouselItem";

interface CreateStoryButtonProps {
  refetchStories: () => void;
}

export default function CreateStoryButton(props: Readonly<CreateStoryButtonProps>) {
  const currentUser = useUserStore((state) => state.user) ?? {
    user_id: 0,
    username: "You",
    activity: UserActivity.Online,
  };

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleDialogClose = () => {
    if (isSubmitting) return; // prevent closing the dialog while submitting
    setFile(null);
    setIsDialogOpen(false);
  };

  const onSubmit = async () => {
    if (!file) return;

    const formData = new FormData();
    if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);

      const isVideoTooLong = await new Promise<boolean>((resolve) => {
        video.onloadedmetadata = () => {
          resolve(video.duration > 60);
        };
      });

      if (isVideoTooLong) {
        toast.error("Video files must be 60 seconds or shorter.");
        setFile(null);
        return;
      }
    }

    setIsSubmitting(true);

    formData.append("file", file);
    formData.append("user_id", currentUser.user_id.toString());

    wretch(`${API_URL}/api/story/upload`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .post(formData)
      .json((response) => {
        toast.success("Story posted successfully!");
        props.refetchStories();
      })
      .catch((error) => {
        toast.error("An error has occurred while posting your story.");
      })
      .finally(() => {
        setIsDialogOpen(false);
        setFile(null);
        setIsSubmitting(false);
      });
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
                  setFile(event.target.files?.[0] ?? null);
                }}
                style={{ display: "none" }}
              />
            </Button>
            <Typography mt={1}>{file ? file.name : ""}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={!file || isSubmitting}
            variant="contained"
            onClick={onSubmit}
          >
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

import RateReviewIcon from "@mui/icons-material/RateReview";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";

import { useState } from "react";

import { toast } from "react-toastify";
import wretch from "wretch";
import { useApplicationStore } from "../stores/ApplicationStore";

interface ICreateDMButtonProps {}

export default function CreateDMButton(props: ICreateDMButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [receiverName, setReceiverName] = useState<string>("");

  const refetchData = useApplicationStore(
    (state) => state.refetchDMChannelsState,
  );

  const onSubmit = () => {
    if (receiverName) {
      wretch(`http://localhost:3001/api/create/dm`)
        .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
        .post({ recipient_name: receiverName })
        .res(() => {
          setIsDialogOpen(false);
          refetchData();
          toast.success("Chat created successfully!");
        })
        .catch((error) => {
          toast.error(error.message);
        });
    }
  };
  return (
    <>
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>New chat</DialogTitle>
        <DialogContent
          sx={{
            minHeight: "100px",
            alignContent: "center",
          }}
        >
          <TextField
            label={"User to DM"}
            title={"receiver_name"}
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={onSubmit}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
      <Button
        sx={{
          height: "52px",
          width: "100%",
          textTransform: "none",
          color: "white",
          gap: "20px",
        }}
        onClick={() => setIsDialogOpen(true)}
      >
        <Typography>Create a new chat</Typography>
        <RateReviewIcon></RateReviewIcon>
      </Button>
    </>
  );
}

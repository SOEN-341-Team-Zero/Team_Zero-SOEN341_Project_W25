import RateReviewIcon from "@mui/icons-material/RateReview";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography
} from "@mui/material";

import { useState } from "react";

import { toast } from "react-toastify";
import wretch from "wretch";
import { useApplicationStore } from "../stores/ApplicationStore";

interface ICreateChatButtonProps {}

export default function CreateChatButton(props: ICreateChatButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [receiverName, setReceiverName] = useState<string>("");

  const refetchData = useApplicationStore(
    (state) => state.refetchTeamChannelsState,
  );

  const onSubmit = () => {
    //TODO: Alter the wretch call to hit a chat create endpoint.
    if (receiverName) {
      wretch(`http://localhost:3001/api/create/channel`)
        .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
        .post()
        .res(() => {
          setIsDialogOpen(false);
          refetchData();
          toast.success("Chat created successfully!");
        })
        .catch((error) => {
          console.error(error);
          toast.error("An error has occurred.");
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
            label={"To"}
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

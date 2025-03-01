import RateReviewIcon from "@mui/icons-material/RateReview";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

import { useState } from "react";

import { toast } from "react-toastify";
import wretch from "wretch";
import { useApplicationStore } from "../../stores/ApplicationStore";
import { API_URL } from "../../utils/FetchUtils";
import UserSearch, {
  UserSearchDialogSlotProps,
  UserSearchMode,
} from "../UserSearch/UserSearch";

interface ICreateDMButtonProps {}

export default function CreateDMButton(props: ICreateDMButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  /**
   * while DMs are meant to only be created with 1 user,
   * we define it as an array here because UserSearch takes an array.
   */
  const [receiverNameArr, setReceiverNameArr] = useState<string[]>([]);

  const refetchData = useApplicationStore(
    (state) => state.refetchDMChannelsState,
  );

  const onSubmit = () => {
    if (receiverNameArr[0]) {
      wretch(`${API_URL}/api/create/dm`)
        .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
        .post({ recipient_name: receiverNameArr[0] })
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
      <Dialog
        slotProps={UserSearchDialogSlotProps}
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      >
        <DialogTitle>New chat</DialogTitle>
        <DialogContent
          sx={{
            minHeight: "100px",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <UserSearch
            singleSelect
            mode={UserSearchMode.CreateDM}
            targetNames={receiverNameArr}
            setTargetNames={setReceiverNameArr}
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

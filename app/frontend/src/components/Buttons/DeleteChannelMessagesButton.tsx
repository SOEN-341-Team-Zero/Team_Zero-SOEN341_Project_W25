import SelectIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";

import { useState } from "react";
import { toast } from "react-toastify";
import wretch from "wretch";
import { useApplicationStore } from "../../stores/ApplicationStore";
import { API_URL } from "../../utils/FetchUtils";

interface IDeleteChannelMessageButtonProps {
  messageIds: number[];
  channelId: number;
  deleteMessages: () => void;
  isSelecting: boolean;
  setIsSelecting: (value: boolean) => void;
  selectionCount: number;
  setSelection: (selection: number[]) => void;
}

export default function DeleteChannelMessagesButton(
  props: Readonly<IDeleteChannelMessageButtonProps>,
) {
  const refetchData = useApplicationStore(
    (state) => state.refetchTeamChannelsState,
  );

  const [isConfirmDialogVisible, setIsConfirmDialogVisible] =
    useState<boolean>(false);

  const handleDeleteIconPressed = () => {
    if (props.isSelecting) {
      if (props.selectionCount > 0) {
        setIsConfirmDialogVisible(true);
      } else {
        props.setIsSelecting(false);
      }
    } else {
      props.setIsSelecting(true);
    }
  };
  const handleDeleteCancel = () => {
    props.setSelection([]);
    props.setIsSelecting(false);
    setIsConfirmDialogVisible(false);
  };

  const handleDeleteConfirm = () => {
    onSubmit();
    setIsConfirmDialogVisible(false);
  };

  const onSubmit = () => {
    if (props.isSelecting) {
      props.setIsSelecting(false);
      if (props.messageIds.length > 0) {
        wretch(`${API_URL}/api/chat/channeldelete/`)
          .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
          .post([[...props.messageIds], [props.channelId]])
          .res(() => {
            refetchData();
            props.deleteMessages();
            toast.success("Messages deleted successfully!");
          })
          .catch((error) => {
            console.error(error);
            toast.error("An error has occurred.");
          });
      }
    } else props.setIsSelecting(true);
  };
  return (
    <>
      <Dialog open={isConfirmDialogVisible}>
        <DialogTitle>
          Deleting {props.selectionCount} Message
          {props.selectionCount > 0 ? "s" : ""}
        </DialogTitle>
        <DialogContent>
          Are you sure you want to delete{" "}
          {props.selectionCount > 0 ? "these messages" : "this message"}?
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleDeleteCancel}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleDeleteConfirm}>
            Confirm Deletion
          </Button>
        </DialogActions>
      </Dialog>
      <Tooltip title="Delete Messages">
        <IconButton
          sx={{ height: "52px", width: "52px" }}
          onClick={handleDeleteIconPressed}
        >
          {props.isSelecting ? (
            <DeleteIcon></DeleteIcon>
          ) : (
            <SelectIcon></SelectIcon>
          )}
        </IconButton>
      </Tooltip>
    </>
  );
}

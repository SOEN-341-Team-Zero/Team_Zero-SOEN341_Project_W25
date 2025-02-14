import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Tooltip,
  } from "@mui/material";
  import SelectIcon from "@mui/icons-material/CheckBoxOutlineBlank";
  import DeleteIcon from "@mui/icons-material/Delete";
  
  import { useState } from "react";
  
  import wretch from "wretch";
  import { toast } from "react-toastify";
  import { useApplicationStore } from "../stores/ApplicationStore";
  
  interface IDeleteChannelMessageButtonProps {messageIds: number[]; channelId: number; deleteMessages: () => void; selection: boolean; setSelection: (value: boolean) => void;}
  
  export default function DeleteChannelButton(props: IDeleteChannelMessageButtonProps) {
  
    const refetchData = useApplicationStore((state) => state.refetchApplicationState);
  
    const onSubmit = () => {
      if (props.selection) {
        props.setSelection(false);
        if(props.messageIds.length > 0) {
            wretch(`http://localhost:3001/api/chat/channeldelete/`)
            .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
            .post({Ids: [props.messageIds, props.channelId]})
            .res(() => {
                refetchData();
                props.deleteMessages();
                toast.success("Messages deleted successfully!");
            })
            .catch((error) => {
                props.deleteMessages(); // Delete this line when backend is ready
                console.error(error);
                toast.error("An error has occurred.");
            });
        }
      } else props.setSelection(true);
    };
    return (
      <>
        <Tooltip title="Delete Messages">
          <IconButton
            sx={{ height: "52px", width: "47%" }}
            onClick={() => onSubmit()}
          >
            {props.selection ? <DeleteIcon></DeleteIcon> : <SelectIcon></SelectIcon>}
          </IconButton>
        </Tooltip>
      </>
    );
  }
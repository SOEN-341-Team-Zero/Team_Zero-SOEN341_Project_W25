import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Paper,
  List,
  ListItem,
  Box
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

import { useState, useRef, useEffect } from "react";

import wretch from "wretch";
import { toast } from "react-toastify";
import { useApplicationStore } from "../stores/ApplicationStore";

interface IInviteToChannelButtonProps {
  teamId: number;
  channelId: number;
  channelName: string;
  refetchData: () => void;
}

export default function InviteToChannelButton(
  props: IInviteToChannelButtonProps,
) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [inviteeNames, setInviteeNames] = useState<string[]>([]);
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [position, setPosition] = useState({top: 0, left: 0, width: 0});
  const searchBarRef = useRef<HTMLInputElement>(null);
  const [alreadyOpen, setAlreadyOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isDialogOpen && !alreadyOpen) {
      getUsers();
      setAlreadyOpen(true);
    }
    if (searchBarRef.current && isDialogOpen) {
      const rect = searchBarRef.current.getBoundingClientRect();
      const dialogRect = document.querySelector(".MuiDialog-paper")?.getBoundingClientRect();
      setPosition({
        top: rect.bottom - (dialogRect ? dialogRect.top : 0),
        left: rect.left - (dialogRect ? dialogRect.left : 0),
        width: rect.width,
      });
    }
  }, [currentUserName, isDialogOpen, showSuggestions]);

  const getUsers = () => {
      wretch(`http://localhost:3001/api/add/sendteamusers`)
        .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
        .post([props.teamId, props.channelId])
        .json((sug) => {setSuggestions(sug);})
        .catch((error) => {
          console.error(error);
          toast.error("An error has occurred.");
      });
  };

  const onSubmit = () => {
    if (inviteeNames.length > 0) {
      wretch(`http://localhost:3001/api/add/addtochannel`)
        .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
        .post({
          team_id: props.teamId,
          channel_id: props.channelId,
          users_to_add: inviteeNames,
        })
        .res(() => {
          props.refetchData();
          toast.success("User" + (inviteeNames.length > 1 ? "s have" : " has") + " been added successfully.");
          quit();
        })
        .catch((error) => {
          console.error(error);
          toast.error("An error has occurred.");
        });
    }
  };

  const quit = () => {
    setIsDialogOpen(false);
    setShowSuggestions(false);
    setInviteeNames([]);
    setCurrentUserName("")
    setAlreadyOpen(false);
  }

  return (
    <>
      <Dialog open={isDialogOpen} onClose={quit}>
        <DialogTitle>Add Users to {props.channelName}</DialogTitle>
        <DialogContent
          sx={{
            minHeight: "100px",
            alignContent: "center",
          }}
        >
          <TextField
            label={"Username"}
            title={"user_name"}
            value={currentUserName}
            onChange={(e) => {
              setCurrentUserName(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={(e) => {
              if(e.key == "Enter") {
                e.preventDefault();
                if(suggestions.includes((e.target as HTMLInputElement).value.trim())) setInviteeNames([...inviteeNames, (e.target as HTMLInputElement).value.trim()]);
                setCurrentUserName("");
              }
            }}
            ref={searchBarRef}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {showSuggestions && <Paper sx={{
            position: "absolute",
            top: position.top,
            left: position.left,
            width: position.width,
            zIndex: 10,
          }}>
            <List>
            {suggestions.map((name) => (name.toLowerCase().startsWith(currentUserName.toLowerCase().trim()) && currentUserName != "" && !inviteeNames.map(inv => inv.toLowerCase()).includes(currentUserName.toLowerCase().trim()) &&
              <ListItem
                component="button"
                key={name}
                onClick={() => {
                  setInviteeNames([...inviteeNames, name]);
                  setCurrentUserName("");
                  setShowSuggestions(false);
                }}
              >
                {name}
              </ListItem>
            ))}
          </List>
          </Paper>}
          <Box>
            <List>
              {inviteeNames.map((name) => (
              <ListItem key={name} sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                padding: "4px 8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                width: "auto"
              }}>
                <Button sx={{
                    minWidth: "30px",
                    height: "30px",
                    padding: 0,
                    borderRadius: "4px"
                  }}
                  onClick={() => {
                    setInviteeNames(inviteeNames.filter(n => n != name));
                }}>
                  ×
                </Button>
                {name}
              </ListItem>))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={onSubmit}>
            Invite
          </Button>
        </DialogActions>
      </Dialog>{" "}
      <Tooltip title="Assign users to this channel">
        <IconButton
          sx={{ maxHeight: "24px", borderRadius: "4px" }}
          edge="end"
          onClick={() => setIsDialogOpen(true)}
        >
          <PersonAddIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}

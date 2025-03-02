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
import GroupAddIcon from "@mui/icons-material/GroupAdd";

import { useState, useRef, useEffect } from "react";

import wretch from "wretch";
import { toast } from "react-toastify";
import { useApplicationStore } from "../stores/ApplicationStore";
import { API_URL } from "../utils/FetchUtils";
import UserList from "./UserList";
import {IUserModel} from "../models/models";

interface IInviteToTeamButtonProps {
  teamId: number;
  teamName: string;
}

export default function InviteToTeamButton(props: IInviteToTeamButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [inviteeNames, setInviteeNames] = useState<string[]>([]);
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [position, setPosition] = useState({top: 0, left: 0, width: 0});
  const searchBarRef = useRef<HTMLInputElement>(null);
  const [alreadyOpen, setAlreadyOpen] = useState<boolean>(false);
  const refetchData = useApplicationStore((state) => state.refetchTeamChannelsState);
  const [users, setUsers] = useState<IUserModel[]>([]);
  const [deletionList, setDeletionList] = useState<IUserModel[]>([]);
  const [key, setKey] = useState<number>(0);
  
  useEffect(() => {
    if (isDialogOpen && !alreadyOpen) {
      getUsers();
      getTeamUsers();
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
    wretch(`${API_URL}/api/add/sendusers`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .headers({ "Content-Type": "application/json" })
      .post(JSON.stringify(props.teamId))
      .json((sug) => {setSuggestions(sug);})
      .catch((error) => {
        console.error(error);
        toast.error("An error has occurred.");
      });
  };
    const getTeamUsers = () => {
      wretch(`${API_URL}/api/add/sendallteamusers`)
        .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
        .headers({"Content-Type": "application/json"})
        .post(JSON.stringify(props.teamId))
        .json((data: {usernames: string[], ids: number[]}) => {
          const {usernames, ids} = data;
          for(let i = 0; i < usernames.length; i++) setUsers((prevUsers) => [...prevUsers, {username: usernames[i], user_id: ids[i]}]);
        })
        .catch((error) => {
          console.error(error);
          toast.error("An error has occurred.");
      });
    }
  const onSubmit = () => {
    if (inviteeNames.length > 0) {
      wretch(`${API_URL}/api/add/addtoteam`)
        .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
        .post({ team_id: props.teamId, users_to_add: inviteeNames, users_to_delete: deletionList.map((u) => u.username) })
        .res(() => {
          refetchData();
          toast.success("User" + (inviteeNames.length > 1 ? "s have" : " has") + " been updated successfully.");
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
    setDeletionList([]);
    setUsers([]);
    setKey(prevKey => prevKey + 1); // Resets the user list
    setAlreadyOpen(false);
  }

  return (
    <>
      <Dialog open={isDialogOpen} onClose={() => quit()}>
        <DialogTitle>Manage Users in {props.teamName}</DialogTitle>
        <DialogContent
          sx={{
            minHeight: "100px",
            alignContent: "center",
          }}
        >
          <TextField
            label={"Users to add"}
            title={"add_users"}
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
            {suggestions.sort((s, r) => s.localeCompare(r)).map((name) => (name.toLowerCase().startsWith(currentUserName.toLowerCase().trim()) && currentUserName != "" && !inviteeNames.map(inv => inv.toLowerCase()).includes(currentUserName.toLowerCase().trim()) &&
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
          <Box><UserList key={key} users={users} isHover={false} update={setDeletionList}/></Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={onSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>{" "}
      <Tooltip title="Manage users in this team">
        <IconButton
          sx={{ height: "52px", width: "47%" }}
          onClick={() => setIsDialogOpen(true)}
        >
          <GroupAddIcon></GroupAddIcon>
        </IconButton>
      </Tooltip>
    </>
  );
}

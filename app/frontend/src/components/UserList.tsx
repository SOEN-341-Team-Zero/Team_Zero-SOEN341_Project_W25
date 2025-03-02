import { TextField, IconButton, Button, Grid2 as Grid, Box } from "@mui/material";
import { IUserModel } from "../models/models";
import { useApplicationStore, ViewModes } from "../stores/ApplicationStore";
import { useUserStore } from "../stores/UserStore";
import UserListItem from "./UserListItem";
import { useState, useRef, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";

interface UserListProps {
  users: IUserModel[];
  isHover: boolean;
  update: (users: IUserModel[]) => void;
}

export default function UserList(props: UserListProps) {
  const applicationState = useApplicationStore();
  const userState = useUserStore();
  const [deletionList, setDeletionList] = useState<IUserModel[]>([]);
  const [userList, setUserList] = useState<IUserModel[]>(props.users);
  const [search, setSearch] = useState<string>("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const uniqueUsers = Array.from(new Map(props.users.map(user => [user.user_id, user])).values());
    setUserList(props.users);
  }, [props.users]);

  const deletion = (user: IUserModel) => {
  
    if (userList.includes(user)) {
      setUserList((prevUserList) => prevUserList.filter((u) => u !== user));
      setDeletionList((prevDeletionList) => {
        const newList = [...prevDeletionList, user];
        props.update(newList);
        return newList;
      });
    } else {
      setDeletionList((prevDeletionList) => {
        const newList = prevDeletionList.filter((u) => u !== user);
        props.update(newList);
        return newList;
      });
      setUserList((prevUserList) => [...prevUserList, user]);
    }
  };

  return (
    <>
      <Grid container spacing={0} alignItems="center" sx={{maxWidth: "201px"}}>
        <Grid size={search != "" ? 10 : 12}><TextField label={props.isHover ? "Search for Users" : "Users to delete"} title={props.isHover ? "user_search" : "delete_users"} ref={searchRef} value={search} onChange={(e) => setSearch((e.target as HTMLInputElement).value)} onKeyDown={(e) => {if(e.key == "Enter") { const users = props.users.filter((u) => u.username === search); users.forEach((user) => {if (user) deletion(user);});}}}/></Grid>
        {search != "" && (<Grid size={2}><IconButton onClick={() => {if(searchRef.current) {setSearch("");}}}><CloseIcon/></IconButton></Grid>)}
      </Grid>
      {deletionList.length > 0 && <Button onClick={() => {
        setUserList([...userList, ...deletionList]);
        setDeletionList([]);
      }}>Reset</Button>}
      {deletionList.filter((u) => u.username.startsWith(search)).sort((u, p) => u.username.localeCompare(p.username)).map((user) => (<UserListItem key={user.user_id} user={user} isHover={props.isHover} toBeDeleted={true} deletion={deletion}/>))}
      <br/>
      {userList.filter((u) => u.username.startsWith(search)).sort((u, p) => u.username.localeCompare(p.username)).map((user) => (<UserListItem key={user.user_id} user={user} isHover={props.isHover} toBeDeleted={false} deletion={deletion}/>))}
      </>
  );
}
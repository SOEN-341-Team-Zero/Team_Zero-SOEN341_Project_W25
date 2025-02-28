import { TextField, IconButton, Grid2 as Grid } from "@mui/material";
import { IUserModel } from "../models/models";
import { useApplicationStore, ViewModes } from "../stores/ApplicationStore";
import { useUserStore } from "../stores/UserStore";
import UserListItem from "./UserListItem";
import { useState, useRef } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Update } from "@mui/icons-material";

interface UserListProps {
  users: IUserModel[];
  isHover: boolean;
  isChannel: boolean;
  update: (users: IUserModel[]) => void;
}

export default function UserList(props: UserListProps) {
  const applicationState = useApplicationStore();
  const userState = useUserStore();
  const [deletionList, setDeletionList] = useState<IUserModel[]>([]);
  const [userList, setUserList] = useState<IUserModel[]>(props.users);
  const [search, setSearch] = useState<string>("");
  const searchRef = useRef<HTMLInputElement>(null);

  const deletion = (user: IUserModel) => {
    if (userList.includes(user)) {
      setUserList(userList.filter((u) => u !== user));
      setDeletionList([...deletionList, user]);
    } else {
      setDeletionList(userList.filter((u) => u !== user));
      setUserList([...deletionList, user]);
    }
    props.update(deletionList);
  }

  return (
    <>
      <Grid container spacing={1} alignItems="center">
        <Grid container alignItems="center" size={12}><TextField ref = {searchRef} onKeyDown = {(e) => (setSearch((e.target as HTMLInputElement).value))}/></Grid>
        <IconButton onClick={() => {if(searchRef.current) {searchRef.current.value = ""; setSearch(searchRef.current.value);}}}><CloseIcon/></IconButton>
      </Grid>
      {deletionList.filter((u) => u.username.startsWith(search)).sort((u, p) => u.username.localeCompare(p.username)).map((user) => (<UserListItem user={user} isHover={props.isHover} toBeDeleted={true} deletion={deletion}/>))}
      {userList.filter((u) => u.username.startsWith(search)).sort((u, p) => u.username.localeCompare(p.username)).map((user) => (<UserListItem user={user} isHover={props.isHover} toBeDeleted={false} deletion={deletion}/>))}
    </>
  );
}
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Grid2 as Grid,
  IconButton,
  List,
  TextField,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { IUserModel, UserActivity } from "../models/models";
import UserListItem from "./UserListItem";

interface UserListProps {
  users: IUserModel[];
  isHover: boolean;
  update?: (users: IUserModel[]) => void;
  fullWidth?: boolean;
}

export default function UserList(props: UserListProps) {
  const [deletionList, setDeletionList] = useState<IUserModel[]>([]);
  const [userList, setUserList] = useState<IUserModel[]>(props.users);
  const [search, setSearch] = useState<string>("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const uniqueUsers = Array.from(
      new Map(props.users.map((user) => [user.user_id, user])).values(),
    );
    setUserList(uniqueUsers);
  }, [props.users]);

  const deletion = (user: IUserModel) => {
    if (userList.includes(user)) {
      setUserList((prevUserList) => prevUserList.filter((u) => u !== user));
      setDeletionList((prevDeletionList) => {
        const newList = [...prevDeletionList, user];
        props.update?.(newList);
        return newList;
      });
    } else {
      setDeletionList((prevDeletionList) => {
        const newList = prevDeletionList.filter((u) => u !== user);
        props.update?.(newList);
        return newList;
      });
      setUserList((prevUserList) => [...prevUserList, user]);
    }
  };

  const userListMaxWidth = props.fullWidth ? "100%" : "400px";

  const activityComparison = (a: IUserModel, b: IUserModel) => {
    if (a.activity === b.activity) return 0;
    if (a.activity === UserActivity.Online) return -1;
    if (b.activity === UserActivity.Online) return 1;
    if (a.activity === UserActivity.Away) return -1;
    if (b.activity === UserActivity.Away) return 1;
    return 0;
  };

  return (
    <Box
      maxWidth="100%"
      alignItems="center"
      justifyContent={"center"}
      p={props.isHover ? 1 : 0}
      maxHeight="60vh"
      overflow={"hidden"}
    >
      <Grid
        container
        spacing={0}
        alignItems="center"
        justifyContent={"center"}
        sx={{ maxWidth: userListMaxWidth }}
      >
        <Grid size={search != "" ? 10 : 12} pt={0.5}>
          <TextField
            fullWidth
            label={props.isHover ? "Search for Users" : "Users to delete"}
            title={props.isHover ? "user_search" : "delete_users"}
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                const users = props.users.filter((u) => u.username === search);
                users.forEach((user) => {
                  if (user) deletion(user);
                });
              }
            }}
          />
        </Grid>
        {search != "" && (
          <Grid size={2}>
            <IconButton
              onClick={() => {
                if (searchRef.current) {
                  setSearch("");
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Grid>
        )}
      </Grid>
      {deletionList.length > 0 && (
        <Button
          onClick={() => {
            setUserList([...userList, ...deletionList]);
            setDeletionList([]);
          }}
        >
          Reset
        </Button>
      )}
      {deletionList.length > 0 && (
        <List
          sx={{ display: "flex", flexDirection: "column", gap: 1 }}
          disablePadding
        >
          {deletionList
            .filter((u) => u.username.startsWith(search))
            .sort((u, p) => u.username.localeCompare(p.username))
            .map((user) => (
              <UserListItem
                key={user.user_id}
                user={user}
                isHover={props.isHover}
                toBeDeleted={true}
                deletion={deletion}
              />
            ))}
        </List>
      )}
      <br />
      <List
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          maxHeight: "50vh",
          overflowY: "scroll",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#899483",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#5F6959",
          },
        }}
        disablePadding
      >
        {userList
          .filter((u) => u.username.startsWith(search))
          .sort((u, p) => u.username.localeCompare(p.username))
          .sort(activityComparison)
          .map((user) => (
            <UserListItem
              key={user.user_id}
              user={user}
              isHover={props.isHover}
              toBeDeleted={false}
              deletion={deletion}
            />
          ))}
      </List>
    </Box>
  );
}

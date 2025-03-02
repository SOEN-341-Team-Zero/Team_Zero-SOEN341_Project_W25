import {
  Box,
  Popover,
  AvatarGroup,
  Avatar
} from "@mui/material";

import { useState, useRef, useEffect } from "react";

import wretch from "wretch";
import { toast } from "react-toastify";
import { API_URL } from "../utils/FetchUtils";
import UserList from "./UserList";
import { IChannelModel, IUserModel } from "../models/models";
import { useApplicationStore } from "../stores/ApplicationStore";
import { stringAvatar } from "../utils/AvatarUtils";

interface IChannelUserListHoverProps {channel: IChannelModel;}

export default function TeamUserListHover(props: Readonly<IChannelUserListHoverProps>) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [users, setUsers] = useState<IUserModel[]>([]);
  const [key, setKey] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const applicationState = useApplicationStore();
  
  const listItemRef = useRef<HTMLLIElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {if (applicationState.selectedChannel !== props.channel) quit();}, [applicationState.selectedChannel]);
  
  const getChannelUsers = () => {
      wretch(`${API_URL}/api/add/sendallchannelusers`)
        .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
        .headers({"Content-Type": "application/json"})
        .post(JSON.stringify(props.channel.id))
        .json((data: {usernames: string[], ids: number[]}) => {
          const {usernames, ids} = data;
          for(let i = 0; i < usernames.length; i++) if(!users.map(u => u.user_id).includes(ids[i])) setUsers((prevUsers) => [...prevUsers, {username: usernames[i], user_id: ids[i]}]);
        })
        .catch((error) => {
          console.error(error);
          toast.error("An error has occurred.");
      });
    }

  const quit = () => {
    setIsDialogOpen(false);
    setUsers([]);
    setKey(prevKey => prevKey + 1);
    setAnchorEl(null);
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    if (applicationState.selectedChannel == props.channel && listItemRef.current && event.relatedTarget && listItemRef.current.contains(event.currentTarget)) {
      setAnchorEl(event.currentTarget);
      setIsDialogOpen(true);
      getChannelUsers();
      requestAnimationFrame(() => {
        const isIns = listItemRef.current?.contains(event.currentTarget) || false;
        if (!isIns) {
          handleMouseLeave(event);
        }
      });
    }
  };
  
  const handleMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
    if (applicationState.selectedChannel == props.channel && popoverRef.current && event.relatedTarget && !popoverRef.current.contains(event.relatedTarget as Node)) {
      if (listItemRef.current && !listItemRef.current.contains(event.relatedTarget as Node)) {
        quit();
        requestAnimationFrame(() => {
          const isIns = !popoverRef.current?.contains(event.currentTarget) || false;
          const isIns2 = !listItemRef.current?.contains(event.currentTarget) || false;
          if (isIns && isIns2) handleMouseEnter(event);
        });
      }
    }
  };

  return (
    <Box>
        <Box ref={listItemRef}
          key={props.channel.id}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={"selected-channel-title"}
          alignContent={"center"}
          justifyItems="center"
        >
        <AvatarGroup max={5}>
          <Avatar {...stringAvatar("apppity ap apple")} />
          <Avatar {...stringAvatar("boom bap")} />
          <Avatar {...stringAvatar("chocolate cat")} />
        </AvatarGroup>
        </Box>
      <Popover
        ref={popoverRef}
        open={isDialogOpen}
        anchorEl={anchorEl}
        onClose={quit}
        disableRestoreFocus
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        onMouseEnter={handleMouseEnter}
      >
        <UserList key={key} users={users} isHover={true} update={() => {}} />
      </Popover>
    </Box>
  );
}
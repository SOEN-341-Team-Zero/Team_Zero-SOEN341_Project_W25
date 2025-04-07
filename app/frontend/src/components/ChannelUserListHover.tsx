import { Avatar, AvatarGroup, Box, Popover } from "@mui/material";

import { useEffect, useRef, useState } from "react";

import { toast } from "react-toastify";
import wretch from "wretch";
import { IChannelModel, IUserModel } from "../models/models";
import { useApplicationStore } from "../stores/ApplicationStore";
import { stringAvatar } from "../utils/AvatarUtils";
import { API_URL } from "../utils/FetchUtils";
import UserList from "./UserList";

interface IChannelUserListHoverProps {
  channel: IChannelModel;
}

export default function TeamUserListHover(
  props: Readonly<IChannelUserListHoverProps>,
) {
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [users, setUsers] = useState<IUserModel[]>([]);
  const [key, setKey] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const applicationState = useApplicationStore();

  const listItemRef = useRef<HTMLLIElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getChannelUsers();
    if (applicationState.selectedChannel !== props.channel) quit();
  }, [applicationState.selectedChannel]);

  const getChannelUsers = () => {
    wretch(
      `${API_URL}/api/add/${props.channel.is_public ? "sendallteamusers" : "sendallchannelusers"}`,
    )
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .headers({ "Content-Type": "application/json" })
      .post(
        JSON.stringify(
          props.channel.is_public ? props.channel.team_id : props.channel.id,
        ),
      )
      .json((data) => {
        const users: { user_id: number; username: string; activity: string }[] =
          data.users;
        setUsers(users);
      })
      .catch((error) => {
        console.error(error);
        toast.error("An error has occurred.");
      });
  };

  const quit = () => {
    setIsPopoverOpen(false);
    setKey((prevKey) => prevKey + 1);
    setAnchorEl(null);
  };

  // Uses the code from handleMouseEnter and handleMouseLeave. This is mostly for mobile users (hovering sucks)
  const handleTitleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isPopoverOpen) {
      const isSelectedChannel = applicationState.selectedChannel === props.channel;
      const hasPopover = popoverRef.current !== null;
      const hasRelatedTarget = event.relatedTarget !== null;
      const isOutsidePopover = !popoverRef.current?.contains(event.relatedTarget as Node);
      const isOutsideList = !listItemRef.current?.contains(event.relatedTarget as Node);
    
      if (isSelectedChannel && hasPopover && hasRelatedTarget && isOutsidePopover && isOutsideList) {
        quit();
    
        requestAnimationFrame(() => {
          const stillOutsidePopover = !popoverRef.current?.contains(event.currentTarget);
          const stillOutsideList = !listItemRef.current?.contains(event.currentTarget);
    
          if (stillOutsidePopover && stillOutsideList) {
            handleMouseEnter(event);
          }
        });
      }
    }    
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    if (
      applicationState.selectedChannel == props.channel &&
      listItemRef.current &&
      event.relatedTarget &&
      listItemRef.current.contains(event.currentTarget)
    ) {
      setAnchorEl(event.currentTarget);
      setIsPopoverOpen(true);
      getChannelUsers();
      requestAnimationFrame(() => {
        const isIns =
          listItemRef.current?.contains(event.currentTarget) || false;
        if (!isIns) {
          handleMouseLeave(event);
        }
      });
    }
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
    if (
      applicationState.selectedChannel == props.channel &&
      popoverRef.current &&
      event.relatedTarget &&
      !popoverRef.current.contains(event.relatedTarget as Node)
    ) {
      if (
        listItemRef.current &&
        !listItemRef.current.contains(event.relatedTarget as Node)
      ) {
        quit();
        requestAnimationFrame(() => {
          const isIns =
            !popoverRef.current?.contains(event.currentTarget) || false;
          const isIns2 =
            !listItemRef.current?.contains(event.currentTarget) || false;
          if (isIns && isIns2) handleMouseEnter(event);
        });
      }
    }
  };

  return (
    <Box>
      <Box
        ref={listItemRef}
        key={props.channel.id}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleTitleClick}
        className={"selected-channel-title"}
        alignContent={"center"}
        justifyItems="center"
      >
        <AvatarGroup max={5}>
          {users.map((user) => (
            <Avatar key={user.user_id} {...stringAvatar(user.username)} />
          ))}
        </AvatarGroup>
      </Box>
      <Popover
        ref={popoverRef}
        open={isPopoverOpen}
        anchorEl={anchorEl}
        onClose={quit}
        disableRestoreFocus
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        onMouseEnter={handleMouseEnter}
        slotProps={{ paper: { sx: { maxWidth: "250px", mt: 1, pt: 0.5 } } }}
      >
        <UserList key={key} users={users} isHover={true} />
      </Popover>
    </Box>
  );
}

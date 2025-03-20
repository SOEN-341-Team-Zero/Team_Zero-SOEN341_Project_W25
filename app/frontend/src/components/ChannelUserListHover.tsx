import { Box, Popover, AvatarGroup, Avatar, Tooltip } from "@mui/material";

import { useState, useRef, useEffect } from "react";

import wretch from "wretch";
import { toast } from "react-toastify";
import { API_URL } from "../utils/FetchUtils";
import UserList from "./UserList";
import { IChannelModel, IUserModel } from "../models/models";
import { useApplicationStore } from "../stores/ApplicationStore";
import { stringAvatar } from "../utils/AvatarUtils";

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
    wretch(`${API_URL}/api/add/sendallchannelusers`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .headers({ "Content-Type": "application/json" })
      .post(JSON.stringify(props.channel.id))
      .json(
        (data: {
          usernames: string[];
          ids: number[];
          activities: string[];
        }) => {
          const { usernames, ids, activities } = data;
          setUsers(
            usernames.map((name, i) => ({
              username: name,
              user_id: ids[i],
              activity: activities[i],
            })),
          );
        },
      )
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
    } else {
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

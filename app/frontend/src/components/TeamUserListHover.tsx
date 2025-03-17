import { Box, Popover, Typography } from "@mui/material";

import { useEffect, useRef, useState } from "react";

import { toast } from "react-toastify";
import wretch from "wretch";
import { ITeamModel, IUserModel } from "../models/models";
import { useApplicationStore } from "../stores/ApplicationStore";
import { API_URL } from "../utils/FetchUtils";
import UserList from "./UserList";

interface ITeamUserListHoverProps {
  team: ITeamModel;
}

export default function TeamUserListHover(
  props: Readonly<ITeamUserListHoverProps>,
) {
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [users, setUsers] = useState<IUserModel[]>([]);
  const [key, setKey] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const applicationState = useApplicationStore();

  const listItemRef = useRef<HTMLLIElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (applicationState.selectedTeam !== props.team) quit();
  }, [applicationState.selectedTeam]);

  const getTeamUsers = (): void => {
    wretch(`${API_URL}/api/add/sendallteamusers`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .headers({ "Content-Type": "application/json" })
      .post(JSON.stringify(props.team.team_id))
      .json((data: { usernames: string[]; ids: number[]; activities: string[]}) => {
        const [usernames, ids, activities] = [data.usernames, data.ids, data.activities];
        setUsers(
          usernames.map((name, i) => ({ username: name, user_id: ids[i], activity: activities[i] })),
        );
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
      if (
        applicationState.selectedTeam == props.team &&
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
        applicationState.selectedTeam == props.team &&
        listItemRef.current &&
        event.relatedTarget &&
        listItemRef.current.contains(event.currentTarget)
      ) {
        setAnchorEl(event.currentTarget);
        setIsPopoverOpen(true);
        getTeamUsers();
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
      applicationState.selectedTeam == props.team &&
      listItemRef.current &&
      event.relatedTarget &&
      listItemRef.current.contains(event.currentTarget)
    ) {
      setAnchorEl(event.currentTarget);
      setIsPopoverOpen(true);
      getTeamUsers();
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
      applicationState.selectedTeam == props.team &&
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
        key={props.team.team_id}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleTitleClick}
        className={"selected-team-title"}
        alignContent={"center"}
        justifyItems="center"
      >
        <Typography noWrap>
          {applicationState.selectedTeam?.team_name}
        </Typography>
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
        slotProps={{ paper: { sx: { maxWidth: "250px", mt: 1, py: 1 } } }} // Added margin-top to start lower
      >
        <UserList key={key} users={users} isHover={true} />
      </Popover>
    </Box>
  );
}

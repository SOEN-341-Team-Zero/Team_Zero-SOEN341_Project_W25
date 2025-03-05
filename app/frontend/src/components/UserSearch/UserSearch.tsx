import { Box, Button, List, ListItem, Paper, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import wretch from "wretch";
import { useApplicationStore } from "../../stores/ApplicationStore";
import { API_URL } from "../../utils/FetchUtils";

export enum UserSearchMode {
  AddToTeam = "AddToTeam",
  AddToChannel = "AddToChannel",
  CreateDM = "CreateDM",
}

export const UserSearchDialogSlotProps = {
  paper: {
    sx: {
      minWidth: "300px",
      width: "80vw",
      maxHeight: "80vh",
      position: "absolute",
      top: "5%",
      transformOrigin: "top center",
    },
  },
};

interface UserSearchProps {
  singleSelect?: boolean;
  channelId?: number;
  teamId?: number;
  mode: UserSearchMode;
  targetNames: string[];
  setTargetNames: (names: string[]) => void;
}

/**
 * The UserSearch component renders a user text input and displays user names
 * whose starts match the query, and that are able to be selected based on conditions like
 * whether the user is in a team or not, or even if they're already in a channel.
 */
export default function UserSearch(props: UserSearchProps) {
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [areSuggestionsVisible, setAreSuggestionsVisible] =
    useState<boolean>(false);

  const currentTeamId =
    props.teamId ?? useApplicationStore((state) => state.selectedTeam?.team_id);

  const currentChannelId =
    props.channelId ??
    useApplicationStore((state) => state.selectedTeam?.team_id);

  useEffect(() => {
    getUsers(); // fetch users in the team that are not in the channel
    return () => {
      props.setTargetNames([]); // reset target names on unmount
    };
  }, []);

  const getUserFetchUrl = () => {
    switch (props.mode) {
      case UserSearchMode.AddToTeam:
        return `${API_URL}/api/add/sendusers?teamId=${currentTeamId}`;
      case UserSearchMode.CreateDM:
        return `${API_URL}/api/create/getusersdm`;
      case UserSearchMode.AddToChannel:
        return `${API_URL}/api/add/sendteamusers?teamId=${currentTeamId}&channelId=${currentChannelId}`;
    }
  };

  const getUsers = () => {
    wretch(getUserFetchUrl())
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .get()
      .json((data) => {
        setSuggestions(data);
      })
      .catch((error) => {
        console.error(error);
        toast.error("An error has occurred.");
      });
  };

  const handleSuggestionClicked = (name: string) => {
    if (props.singleSelect) {
      props.setTargetNames([name]);
    } else {
      props.setTargetNames([...props.targetNames, name]);
    }
    setCurrentUserName("");
    setAreSuggestionsVisible(false);
  };

  const renderSuggestions = () => {
    const inviteeNamesLowerCase = props.targetNames.map((inv) =>
      inv.toLowerCase(),
    );
    const listItems: JSX.Element[] = [];
    suggestions.forEach((name) => {
      if (
        name.toLowerCase().startsWith(currentUserName.toLowerCase().trim()) &&
        !inviteeNamesLowerCase.includes(name.toLowerCase().trim())
      ) {
        listItems.push(
          <ListItem
            component="button"
            key={name}
            sx={{
              "&:hover": {
                border: "1px solid #669266",
              },
            }}
            onClick={() => handleSuggestionClicked(name)}
          >
            {name}
          </ListItem>,
        );
      }
    });

    if (listItems.length === 0) {
      return <ListItem key={"no_matches_found"}>No matches found.</ListItem>;
    }
    return listItems;
  };

  return (
    <Box pt={"12px"} width={"100%"}>
      <Box sx={{ pb: "8px" }}>
        <TextField
          slotProps={{ htmlInput: { autoComplete: "off" } }}
          fullWidth
          label={"Username"}
          title={"user_name"}
          value={currentUserName}
          onChange={(e) => {
            setCurrentUserName(e.target.value);
            setAreSuggestionsVisible(e.target.value.length > 0);
          }}
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              e.preventDefault();
              if (
                suggestions.includes(
                  (e.target as HTMLInputElement).value.trim(),
                )
              )
                props.setTargetNames([
                  ...props.targetNames,
                  (e.target as HTMLInputElement).value.trim(),
                ]);
              setCurrentUserName("");
            }
          }}
        />
      </Box>
      <Box
        sx={{
          overflowY: "auto",
          maxHeight: `${35}vh`,
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
      >
        <Box>
          {props.targetNames.length > 0 && (
            <List
              disablePadding
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                pb: "8px",
              }}
            >
              {props.targetNames.map((name) => (
                <ListItem
                  key={name}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    width: "auto",
                  }}
                >
                  <Button
                    sx={{
                      minWidth: "30px",
                      height: "30px",
                      padding: 0,
                      borderRadius: "4px",
                    }}
                    onClick={() => {
                      props.setTargetNames(
                        props.targetNames.filter((n) => n != name),
                      );
                    }}
                  >
                    x
                  </Button>
                  {name}
                </ListItem>
              ))}
            </List>
          )}
        </Box>
        <Box>
          {areSuggestionsVisible && (
            <Paper sx={{ width: "100%" }}>
              <List
                disablePadding
                sx={{ display: "flex", flexDirection: "column", gap: 1 }}
              >
                {renderSuggestions()}
              </List>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
}

import { Box, Grid2 as Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { IChannelRequestModel, IUserModel } from "../../models/models";
import RequestsList from "../Requests/RequestsList";
import UserList from "../UserList";
import wretch from "wretch";
import { API_URL } from "../../utils/FetchUtils";
import { toast } from "react-toastify";

// sample requests for testing
const sampleRequests: IChannelRequestModel[] = [
  {
    request_id: 1,
    requester_id: 101,
    requester_username: "user1",
    channel_id: 201,
    channel_name: "general",
    team_name: "Team Alpha",
  },
  {
    request_id: 2,
    requester_id: 102,
    requester_username: "user2",
    channel_id: 202,
    channel_name: "random",
    team_name: "Team Beta",
  },
  {
    request_id: 3,
    requester_id: 103,
    requester_username: "user3",
    channel_id: 203,
    channel_name: "dev",
    team_name: "Team Gamma",
  },
  {
    request_id: 4,
    requester_id: 104,
    requester_username: "user4",
    channel_id: 204,
    channel_name: "design",
    team_name: "Team Delta",
  },
  {
    request_id: 5,
    requester_id: 105,
    requester_username: "user5",
    channel_id: 205,
    channel_name: "marketing",
    team_name: "Team Epsilon",
  },
  {
    request_id: 6,
    requester_id: 106,
    requester_username: "user6",
    channel_id: 206,
    channel_name: "sales",
    team_name: "Team Zeta",
  },
  {
    request_id: 7,
    requester_id: 107,
    requester_username: "user7",
    channel_id: 207,
    channel_name: "support",
    team_name: "Team Eta",
  },
  {
    request_id: 8,
    requester_id: 108,
    requester_username: "user8",
    channel_id: 208,
    channel_name: "hr",
    team_name: "Team Theta",
  },
  {
    request_id: 9,
    requester_id: 109,
    requester_username: "user9",
    channel_id: 209,
    channel_name: "finance",
    team_name: "Team Iota",
  },
  {
    request_id: 10,
    requester_id: 110,
    requester_username: "user10",
    channel_id: 210,
    channel_name: "legal",
    team_name: "Team Kappa",
  },
  {
    request_id: 11,
    requester_id: 111,
    requester_username: "user11",
    channel_id: 211,
    channel_name: "operations",
    team_name: "Team Lambda",
  },
  {
    request_id: 12,
    requester_id: 112,
    requester_username: "user12",
    channel_id: 212,
    channel_name: "it",
    team_name: "Team Mu",
  },
  {
    request_id: 13,
    requester_id: 113,
    requester_username: "user13",
    channel_id: 213,
    channel_name: "engineering",
    team_name: "Team Nu",
  },
  {
    request_id: 14,
    requester_id: 114,
    requester_username: "user14",
    channel_id: 214,
    channel_name: "product",
    team_name: "Team Xi",
  },
  {
    request_id: 15,
    requester_id: 115,
    requester_username: "user15",
    channel_id: 215,
    channel_name: "qa",
    team_name: "Team Omicron",
  },
  {
    request_id: 16,
    requester_id: 116,
    requester_username: "user16",
    channel_id: 216,
    channel_name: "research",
    team_name: "Team Pi",
  },
];

export default function DashboardRequestsTabContent() {
  const [requests, setRequests] =
    useState<IChannelRequestModel[]>(sampleRequests);
  const [users, setUsers] = useState<IUserModel[]>([]);

  const refetchRequests = () => {
    // TODO implement refetch method
  };

  const fetchUsers = () => {
    wretch(`${API_URL}/api/user/getallusers`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .get()
      .json((data) => {
        setUsers(data.map((user: IUserModel) => ({...user, activity: "Offline"}))); // TODO add activity
      })
      .catch((error) => {
        console.error(error);
        toast.error("An error has occurred.");
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  //TODO handle mobile view
  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
      }}
    >
      <Grid container mt={"12px"}>
        <Grid size={{ xs: 12, sm: 9 }}>
          <RequestsList requests={requests} />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <UserList isHover users={users} height={90}/>
        </Grid>
      </Grid>
    </Box>
  );
}

import { Box, Grid2 as Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { IChannelRequestModel, IUserModel } from "../../models/models";
import RequestsList from "../Requests/RequestsList";
import UserList from "../UserList";
import wretch from "wretch";
import { API_URL } from "../../utils/FetchUtils";
import { toast } from "react-toastify";

export default function DashboardRequestsTabContent() {
  const [requests, setRequests] =
    useState<IChannelRequestModel[]>([]);
  const [users, setUsers] = useState<IUserModel[]>([]);

  useEffect(() => {
    refetchRequests();
  }, []);

  const refetchRequests = () => {
    wretch(`${API_URL}/api/request/requests`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .get()
      .json((data) => {
        console.log(data);
        setRequests(data);
      })
      .catch((error) => {
        console.error(error);
        toast.error("An error has occurred.");
      });
  };

  const fetchUsers = () => {
    wretch(`${API_URL}/api/user/getallusers`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .get()
      .json((data) => {
        setUsers(data.map((user: IUserModel) => ({ ...user })));
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
          <RequestsList requests={requests} setRequests={setRequests} refetchRequests={refetchRequests} />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <UserList isHover users={users} height={90} />
        </Grid>
      </Grid>
    </Box>
  );
}

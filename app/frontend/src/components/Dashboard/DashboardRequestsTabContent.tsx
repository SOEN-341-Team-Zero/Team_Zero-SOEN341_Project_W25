import { Box, Grid2 as Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { IRequestModel, IUserModel } from "../../models/models";
import RequestsList from "../Requests/RequestsList";
import UserList from "../UserList";
import wretch from "wretch";
import { API_URL } from "../../utils/FetchUtils";
import { toast } from "react-toastify";
import { isMobile } from "../../utils/BrowserUtils";

export default function DashboardRequestsTabContent() {
  const [requests, setRequests] = useState<IRequestModel[]>([]);
  const [users, setUsers] = useState<IUserModel[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const refetchRequests = () => {
    setIsFetching(true);
    wretch(`${API_URL}/api/request/requests`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .get()
      .json((data) => {
        setRequests(data);
        setIsFetching(false);
      })
      .catch((error) => {
        console.error(error);
        toast.error("An error has occurred.");
        setIsFetching(false);
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
    refetchRequests();
    fetchUsers();
  }, []);

  //TODO handle mobile view
  const isUserMobile = isMobile();
  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
      }}
    >
      <Grid container mt={"12px"}>
        <Grid
          size={{ xs: 12, sm: 7, md: 8 }}
          style={{ overflowY: "hidden" }}
          sx={{ maxHeight: isUserMobile ? "42vh" : "auto" }}
        >
          <RequestsList
            requests={requests}
            setRequests={setRequests}
            refetchRequests={refetchRequests}
            isFetching={isFetching}
          />
        </Grid>
        <Grid
          size={{ xs: 12, sm: 5, md: 4 }}
          style={{ overflowY: "hidden" }}
          sx={{ maxHeight: isUserMobile ? "42vh" : "auto" }}
        >
          <UserList fullWidth isHover users={users} height={85} />
        </Grid>
      </Grid>
    </Box>
  );
}

import { Box, Button, Container, TextField, Typography } from "@mui/material";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/FetchUtils";
import { useUserStore } from "../../stores/UserStore";
export interface ILoginFormProps {}

export default function LoginForm(props: ILoginFormProps) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const setIsAuthenticated = useUserStore((state) => state.setIsLoggedIn);

  const handleSetCookies = async (data: any) => {
    localStorage.setItem("jwt-token", data.token);
    Cookies.set("isLoggedIn", "true", { expires: 0.25, path: "/" });
    setIsAuthenticated(true);
  };

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/login/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: `${username}`,
          password: `${password}`,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        // this is the auth token for the API endpoints.
        // this cookie is only for rendering. API is authenticated using JWT.

        handleSetCookies(data).then(() => {
          navigate("/home");
        });
      } else {
        toast.error(`❌ Error: ${data.error || "Login failed"}`);
        return;
      }
    } catch (error) {
      toast.error("❌ Network error. Please try again.");
      console.error(error);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          p: 3,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="current-username"
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </form>
      </Box>
    </Container>
  );
}

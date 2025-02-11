import { Box, Button, Container, TextField, Typography } from "@mui/material";
import Cookies from "js-cookie";
import { useState } from "react";
import { login } from "../api/auth"; // Import the API call function
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const data = await login(username, password);
      console.log("Login successful");
      localStorage.setItem("jwt-token", data.token);
      Cookies.set("isLoggedIn", "true", { expires: 1, path: "/" });

      console.log("Navigating to /home");
      navigate("/home");
    } catch (error) {
      toast.error(
        "❌ Error: " +
          (error instanceof Error ? error.message : "Login failed"),
      );
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

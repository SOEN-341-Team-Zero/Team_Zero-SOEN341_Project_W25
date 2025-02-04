import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
export interface IRegisterFormProps {}

export default function RegisterForm(props: IRegisterFormProps) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Username:", username, "Password:", password);
    try {
          const response = await fetch(`/api/register/validate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: `${username}`,
              password: `${password}`,
            }),
          });
    
          if (response.ok) {
            const data = await response.json();
            console.log("Register and login successful");
            // this is the auth token for the API endpoints
            localStorage.setItem("jwt-token", data.token);
            //this cookie is only for rendering. API is authenticated using JWT.
            Cookies.set("isLoggedIn", "true", { expires: 1, path: "/" }); //
            navigate("/home");
          } else {
            console.error("Error:");
          }
        } catch (error) {
          console.error("Network Error:", error);
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
          Register
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
            Register
          </Button>
        </form>
      </Box>
    </Container>
  );
}

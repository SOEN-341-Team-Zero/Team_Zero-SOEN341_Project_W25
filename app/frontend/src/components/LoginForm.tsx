import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useState } from "react";

export interface ILoginFormProps {}

export default function LoginForm(props: ILoginFormProps) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    try {
      const response = await fetch(`http://localhost:3000/api/login/validate?username=${username}&password=${password}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("Success:", data);
      } else {
        console.error("Error:", data);
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

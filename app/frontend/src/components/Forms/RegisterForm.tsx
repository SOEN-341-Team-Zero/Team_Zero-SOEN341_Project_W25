import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  FormGroup,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/FetchUtils";

export interface IRegisterFormProps {}

export default function RegisterForm(props: IRegisterFormProps) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/register/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: `${username}`,
          password: `${password}`,
          isAdmin: isAdmin,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Account registered successfully!");
        navigate("/");
      } else {
        throw new Error(data.error || "Registration failed");
      }
    } catch (error: any) {
      toast.error(`❌ Error: ${error.message}`); //
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
          Create a new account
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="current-username"
            required
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
            required
          />
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox onChange={(e) => setIsAdmin(e.target.checked)} />
              }
              label="I want to be an administrator"
            />
          </FormGroup>

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

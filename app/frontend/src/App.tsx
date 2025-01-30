import "./App.css";
import {
  Box,
  createTheme,
  Link,
  ThemeProvider,
  Tooltip,
  Typography,
} from "@mui/material";
import { GitHub } from "@mui/icons-material";
import LoginForm from "./components/LoginForm";

function App() {
  const theme = createTheme({
    palette: {
      mode: "dark",
      background: {
        paper: "#1e1e1e",
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Tooltip title={"Access Team Zero's GitHub Repo"}>
          <Link
            href="https://github.com/SOEN-341-Team-Zero/Team_Zero-SOEN341_Project_W25"
            target="_blank"
          >
            <GitHub sx={{ fontSize: 60 }} /> {/*github logo from material ui*/}
          </Link>
        </Tooltip>
        <Typography variant={"h1"}>ChatHaven</Typography>
        <Box>
          <LoginForm />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;

import { useState } from "react";
import "./App.css";
import "./material.css";
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
        <Typography variant={"h1"}>Chat Haven</Typography>
        <Box>
          <LoginForm />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;

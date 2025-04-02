import { createTheme, ThemeProvider } from "@mui/material";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import "./styles/App.css";

import LandingPage from "./pages/LandingPage";

import { useUserStore } from "./stores/UserStore";

function App() {
  const isAuthenticated = useUserStore((state) => state.isLoggedIn);

  const theme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#669266",
      },
      secondary: {
        main: "#999",
      },
      background: {
        paper: "#1f241e",
      },
    },
    components: {
      MuiLink: {
        styleOverrides: {
          root: {
            color: "#4a644a",
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <ToastContainer theme="dark" />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/home" /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? <Navigate to="/home" /> : <RegisterPage />
            }
          />
          <Route
            path="/home"
            element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

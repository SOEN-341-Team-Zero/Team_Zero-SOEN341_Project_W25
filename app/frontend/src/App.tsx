import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import { createTheme, ThemeProvider } from "@mui/material";
import Cookies from "js-cookie";
import "./styles/App.css";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";

import LandingPage from './pages/LandingPage';

import { useUserStore } from "./stores/UserStore";


function App() {
  const isAuthenticated = useUserStore((state) => state.isLoggedIn);



  // useEffect(() => {
  //   const loggedIn = Cookies.get("isLoggedIn") === "true";

  //     setIsAuthenticated(loggedIn);
  // }, [Cookies.get("isLoggedIn")]);

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
        <Route
             path="/" element={<LandingPage />}
          />
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

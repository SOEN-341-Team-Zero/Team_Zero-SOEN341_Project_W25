import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./components/HomePage";
import RegisterPage from "./pages/RegisterPage";
import { createTheme, ThemeProvider } from "@mui/material";
import Cookies from "js-cookie";
import "./styles/App.css";
import { useEffect, useState } from "react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loggedIn = Cookies.get("isLoggedIn") === "true";
    setIsAuthenticated(loggedIn);
  }, []);

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
      <Router>
        <Routes>
          <Route
            path="/"
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
            element={isAuthenticated ? <HomePage /> : <Navigate to="/" />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

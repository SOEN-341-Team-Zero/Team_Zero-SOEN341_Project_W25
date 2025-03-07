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
import { useUserStore } from "./stores/UserStore";
import "./styles/App.css";

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

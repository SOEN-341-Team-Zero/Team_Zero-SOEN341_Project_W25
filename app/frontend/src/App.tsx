import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { createTheme, ThemeProvider } from "@mui/material";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./components/HomePage";

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
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} /> {/* will need to redefine */}
          <Route path="/register" element={<RegisterPage />} /> 
          <Route path="/home" element={<HomePage />} /> {/* will need to redefine */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

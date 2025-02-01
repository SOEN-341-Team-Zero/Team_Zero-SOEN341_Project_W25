import axios, { AxiosResponse, AxiosError } from "axios"; // Ensure correct import
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./components/HomePage";
import RegisterPage from "./pages/RegisterPage";

function App() {

  const theme = createTheme({
    palette: {
      mode: "dark",
      background: {
        paper: "#1e1e1e",
      },
    },
  });
  const sessionToken = localStorage.getItem('sessionToken'); 
  //we will return a session token on the backend as well as a JWT token for the database auth

  useEffect(() => {
    axios.get("http://localhost:3001/api/example") // Adjust port
      .then((response: AxiosResponse) => { // Explicitly type 'response'
        setData(response.data.message);
      })
      .catch((error: AxiosError) => { // Explicitly type 'error'
        console.error("Error fetching data:", error);
      });
  }, []);

  return (

    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />{" "}
          {/* will need to redefine */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/home" element={<HomePage />} />{" "} {/* only if authed */}
          {/* will need to redefine */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
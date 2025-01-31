import axios, { AxiosResponse, AxiosError } from "axios"; // Ensure correct import
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./components/HomePage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  const [data, setData] = useState("");

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
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;
import {
  Typography,
  Container,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import RegisterForm from "../components/Forms/RegisterForm";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Container
      maxWidth="sm"
      style={{
        height: isMobile ? "auto" : "100vh",
        width: "100vw",
        alignContent: "center",
      }}
    >
      <Typography
        variant={isMobile ? "h3" : "h1"}
        style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}
        onClick={() => navigate('/')}
      >
        ChatHaven
      </Typography>
      <RegisterForm />
      <Box height={"50px"} alignContent={"center"}>
        <Typography variant="body1">
          On second thought,{" "}
          <Link to="/login">maybe I do already have an account...</Link>
        </Typography>
      </Box>
    </Container>
  );
}

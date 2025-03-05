import {
  Box,
  Container,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";
import LoginForm from "../components/Forms/LoginForm";

export default function LoginPage() {
  const theme = useTheme();
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
      >
        ChatHaven
      </Typography>
      <LoginForm />
      <Box height={"50px"} alignContent={"center"}>
        <Typography variant="body1">
          Don't have an account? <Link to="/register">Create an account</Link>
        </Typography>
      </Box>
    </Container>
  );
}

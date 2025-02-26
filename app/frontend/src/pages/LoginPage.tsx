import { Tooltip, Typography, Container, Box } from "@mui/material";
import LoginForm from "../components/LoginForm";
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <Container maxWidth="sm">
      <Typography variant={"h1"}>ChatHaven</Typography>
      <LoginForm />
      <Box height={"50px"} alignContent={"center"}>
        <Typography variant="body1">
          Don't have an account? <Link to="/register">Create an account</Link>
        </Typography>
      </Box>
    </Container>
  );
}

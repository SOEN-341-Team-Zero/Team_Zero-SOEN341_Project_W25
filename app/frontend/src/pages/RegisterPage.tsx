import { Typography, Container, Box } from "@mui/material";
import RegisterForm from "../components/RegisterForm";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  return (
    <Container maxWidth="sm">
      <Typography variant={"h1"}>ChatHaven</Typography>
      <RegisterForm />
      <Box height={"50px"} alignContent={"center"}>
        <Typography variant="body1">
          On second thought,{" "}
          <Link to="/">maybe I do already have an account...</Link>
        </Typography>
      </Box>
    </Container>
  );
}

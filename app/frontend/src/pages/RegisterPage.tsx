import { Typography, Container } from "@mui/material";
import RegisterForm from "../components/RegisterForm";

export default function RegisterPage() {
  return (
    <Container maxWidth="sm">
      <Typography variant={"h1"}>ChatHaven</Typography>
      <RegisterForm />
    </Container>
  );
}

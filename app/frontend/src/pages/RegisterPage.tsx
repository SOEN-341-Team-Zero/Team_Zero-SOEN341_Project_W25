import { Typography, Container, Box, Link } from "@mui/material";
import RegisterForm from "../components/RegisterForm";

export default function RegisterPage() {
  return (
    <Container maxWidth="sm">
      <Typography variant={"h1"}>ChatHaven</Typography>
      <RegisterForm />
      <Box height={"50px"} alignContent={"center"}>
        <Typography variant="body1">
          On second thought,{" "}
          <Link href="/">maybe I do already have an account...</Link>
        </Typography>
      </Box>
    </Container>
  );
}

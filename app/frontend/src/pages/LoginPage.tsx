import { GitHub } from "@mui/icons-material";
import { Tooltip, Link, Typography, Container } from "@mui/material";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <Container maxWidth="sm">
      <Tooltip title={"Access Team Zero's GitHub Repo"}>
        <Link
          href="https://github.com/SOEN-341-Team-Zero/Team_Zero-SOEN341_Project_W25"
          target="_blank"
        ></Link>
      </Tooltip>
      <Typography variant={"h1"}>ChatHaven</Typography>
      <LoginForm />
    </Container>
  );
}

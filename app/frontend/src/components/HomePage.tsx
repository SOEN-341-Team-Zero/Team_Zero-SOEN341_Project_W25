import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItemText,
  Typography,
  ListItemButton,
  Container,
  Button,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useContext, useState } from "react";
import Cookies  from "js-cookie";
const drawerWidth = 300;

export default function HomePage() {
  const authedApiTest = async () => {
    // API TEST ENDPOINT!
    try {
      const response = await fetch(`http://localhost:3001/api/home/auth-test`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt-token")}`, // you NEED to add this token for each request
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log("AUTH TEST SUCCESSFUL");
      } else {
        console.error("Error:", data);
      }
    } catch (error) {
      console.error("Network Error:", error);
    }
  };
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  const logOut = () =>{
    Cookies.remove("isLoggedIn");
    localStorage.removeItem("jwt-token");
    window.location.href = "http://localhost:5173" // modify this later probably
  }
  return (
    <div style={{ display: "flex" }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            ChatHaven
          </Typography>
          <Box sx={{ ml: 'auto' }}>
            <Button variant="contained" onClick={logOut}>
              Log out
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
          },
        }}
      >
        <List>
          {["Home", "About", "Contact"].map((text, index) => (
            <ListItemButton key={text}>
              <ListItemText primary={text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <main style={{ flexGrow: 1, padding: "16px", marginTop: "64px" }}>
        <Container maxWidth="sm">
          You are logged in!
          <Button variant="contained" onClick={authedApiTest}>
            {" "}
            {/* to remove soon ! */}
            Click me to test Auth API
          </Button>
        </Container>
      </main>
  
    </div>
  );
}

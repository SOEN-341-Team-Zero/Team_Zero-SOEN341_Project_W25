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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";

const drawerWidth = 300;

export default function HomePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

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
            this is where messages will be probably
        </Container>
      </main>
    </div>
  );
}

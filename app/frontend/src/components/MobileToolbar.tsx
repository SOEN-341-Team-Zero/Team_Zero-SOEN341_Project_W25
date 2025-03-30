import { Grid2 as Grid, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

interface MobileToolbarProps {
  toggleSidebar: () => void;
}

export default function MobileToolbar(props: MobileToolbarProps) {
  return (
    <Grid
      container
      className={"channel-title-bar"}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "start",
        mb: "8px",
      }}
    >
      <IconButton
        size="large"
        edge="start"
        color="inherit"
        aria-label="menu"
        disableFocusRipple
        onClick={() => {
          props.toggleSidebar();
        }}
      >
        <MenuIcon />
      </IconButton>
      <Typography variant="h6">ChatHaven</Typography>
    </Grid>
  );
}

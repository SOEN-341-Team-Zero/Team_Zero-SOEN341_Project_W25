import { styled, Badge, IconButton } from "@mui/material";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

export default function CreateBadge(props: { children?: React.ReactNode, handleCreateClicked?: () => void }) {
  const StyledBadge = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
      backgroundColor: "#669266",
      color: "#ffffff90",
      border: "none",
      height: "20px",
      width: "20px",
    },
  }));

  return (
    <StyledBadge
      overlap="circular"
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      badgeContent={
        <IconButton onClick={props.handleCreateClicked}>
          <AddCircleOutlineIcon />
        </IconButton>
      }
    >
      {props.children}
    </StyledBadge>
  );
}

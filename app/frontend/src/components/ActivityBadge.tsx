import { Badge, styled } from "@mui/material";
import { UserActivity } from "../models/models";

interface ActivityBadgeProps {
  activity: UserActivity;
  children?: React.ReactNode;
  disableAnimation?: boolean;
}
/**
 * Styled badge taken from MUI's demo https://mui.com/material-ui/react-avatar/
 */
export default function ActivityBadge(props: Readonly<ActivityBadgeProps>) {

  let badgeColor = "gray";

  if (props.activity === "Online") {
    badgeColor = "green";
  } else if (props.activity === "Away") {
    badgeColor = "orange";
  }
  

  const badgeAnimation =
    props.activity == "Online" && !props.disableAnimation
      ? "ripple 1.2s infinite ease-in-out"
      : "";

  const badgeBorder =
    props.activity == "Online" && !props.disableAnimation
      ? "1px solid currentColor"
      : "";

  const StyledBadge = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
      backgroundColor: badgeColor,
      color: badgeColor,
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      "&::after": {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        animation: badgeAnimation,
        border: badgeBorder,
        content: '""',
      },
    },
    "@keyframes ripple": {
      "0%": {
        transform: "scale(.8)",
        opacity: 1,
      },
      "100%": {
        transform: "scale(2.4)",
        opacity: 0,
      },
    },
  }));

  return (
    <StyledBadge
      overlap="circular"
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      variant="dot"
    >
      {props.children}
    </StyledBadge>
  );
}

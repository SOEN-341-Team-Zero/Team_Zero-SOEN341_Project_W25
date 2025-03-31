import { useMediaQuery, useTheme } from "@mui/material";

export function isMobile() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("sm"));
}

// from MUI avatar "Letter avatars" demo, https://mui.com/material-ui/react-avatar/
// copilot adjusted for pastel colors.
export function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    const pastelValue = Math.floor((value + 255) / 2); // Adjust to pastel range
    color += `00${pastelValue.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

// Copilot generated
function getContrastText(color: string) {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#FFFFFF";
}

// from MUI avatar "Letter avatars" demo, https://mui.com/material-ui/react-avatar/
export function stringAvatar(name: string) {
  return {
    sx: {
      bgcolor: stringToColor(name),
      color: getContrastText(stringToColor(name)),
    },
    children: `${name.split(" ")[0]?.[0] ?? ""}${name.split(" ")[1]?.[0] ?? ""}`,
  };
}

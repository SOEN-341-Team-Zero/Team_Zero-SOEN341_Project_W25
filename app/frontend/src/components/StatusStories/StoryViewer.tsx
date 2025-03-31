import { Box } from "@mui/material";
import { isMobile } from "../../utils/BrowserUtils";

export default function StoryViewer() {
  const isUserMobile = isMobile();

  const fileUrl =
    "https://media.greenscreenmemes.com/2024/11/Oiia-spinning-cats-green-screen.mp4";

  const fileType: string = "video";
//   const fileType: string = "image";

  return (
    <Box
      className="story-viewer"
      p={0}
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        height: "100%",
        width: "100%",
        overflow: "hidden",
        maxHeight: isUserMobile ? "67vh" : "75vh",
      }}
    >
      <Box
        style={{
          width: "100%",
          height: "100%",
          maxHeight: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {fileType === "image" ? (
          <img
            style={{
              height: "100%",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
            src={
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSN5kyGXRsJTnCvfM371Ycg8u7k9viw1gW-g&s"
              // "https://images.unsplash.com/photo-1472491235688-bdc81a63246e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              // "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2F0fGVufDB8fDB8fHww"
              // "https://www.shutterstock.com/image-photo/gray-fluffy-cat-is-concept-260nw-1086193616.jpg"
              // "https://preview.redd.it/a-tall-cat-in-a-car-v0-eapv0bmk17wb1.jpg?width=640&crop=smart&auto=webp&s=dd16531c8556849ee1bc2a959cde17416455b722"
            }
            alt="Story"
          />
        ) : fileType === "video" ? (
          <video
            controls
            style={{
              height: "100%",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          >
            <source src={fileUrl} type="video/mp4" />
          </video>
        ) : null}
      </Box>
    </Box>
  );
}

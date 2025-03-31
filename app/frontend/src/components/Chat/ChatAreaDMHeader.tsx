import { Avatar, Grid2 as Grid, Typography, Box, Tooltip, Divider } from "@mui/material";
import { useEffect, useState } from "react";
import { IDMChannelModel, UserActivity } from "../../models/models";
import "../../styles/ChatArea.css";
import { stringAvatar } from "../../utils/AvatarUtils";
import ActivityBadge from "../ActivityBadge";
import { formatLastSeen } from "../../utils/TimeUtils";

interface ChatAreaDMHeaderProps {
  currentDMChannel: IDMChannelModel | null;
}

export default function ChatAreaDMHeader(props: ChatAreaDMHeaderProps) {
  const title = props.currentDMChannel?.otherUser?.username ?? "";
  const userId = props.currentDMChannel?.otherUser?.user_id;
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLastSeen = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const response = await fetch('/api/home/last-seen', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ UserId: userId })
        });
        if (!response.ok) {
          throw new Error('Failed to fetch last seen data');
        }
        const data = await response.json();
        setLastSeen(data.last_seen);
      } catch (error) {
        console.error('Error fetching last seen:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLastSeen();
  }, [userId]);

  return (
    <Grid
      container
      className={"channel-title-bar"}
      style={{ display: "flex", alignItems: "center" }}
    >
      {!!props.currentDMChannel && (
        <Grid
          size={{ xs: 12 }}
          style={{ display: "flex", alignItems: "center" }}
          spacing={2}
          container
        >
          <ActivityBadge
            activity={
              (props.currentDMChannel.otherUser.activity as UserActivity) ??
              "Offline"
            }
          >
            <Avatar
              {...stringAvatar(title, { width: "36px", height: "36px" })}
            />
          </ActivityBadge>
          <Box sx={{ display: "flex", flexDirection: "row", ml: 1 }}>
            <Typography
              style={{
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                flexShrink: 0,
              }}
            >
              {title}
            </Typography>
            
            {props.currentDMChannel.otherUser.activity !== "Online" && (
              <Tooltip title={lastSeen ? new Date(lastSeen).toLocaleString() : 'Never online'}>
                 <Box display={{ xs: "none", md: "flex" }}>
                <Divider
                  orientation="vertical"
                  flexItem
                  style={{ margin: "0 8px" }}
                />
                <Typography
                  color="secondary"
                  style={{
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    flexShrink: 1,
                  }}
                >
                  {loading ? 'Loading...' : "Last Seen " + formatLastSeen(lastSeen)}
                </Typography>
              </Box>
                  
              </Tooltip>
            )}
          </Box>
        </Grid>
      )}
    </Grid>
  );
}
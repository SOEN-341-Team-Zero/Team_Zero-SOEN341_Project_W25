import { Button, Typography } from "@mui/material";
interface ReactionButtonProps {
    readonly numReactions: number;
    readonly emoji: string;
    readonly onReact: () => void;
}
export default function ReactionButton(props: ReactionButtonProps) {return (<Button onClick={props.onReact} disableFocusRipple variant={"outlined"} sx={{ backgroundColor: "rgba(34, 34, 34, 0.5)"}}><Typography>{props.emoji} {props.numReactions}</Typography></Button>)}
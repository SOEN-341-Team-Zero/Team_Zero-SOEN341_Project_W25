import { Button, Typography } from "@mui/material";
interface ReactionButtonProps {
    readonly numReactions: number;
    readonly emoji: string;
    readonly userSelected: boolean;
    readonly onReact: () => void;
}
export default function ReactionButton(props: ReactionButtonProps) {return (<Button onClick={props.onReact} disableFocusRipple variant={"outlined"} sx={{ backgroundColor: props.userSelected ? "rgba(102, 146, 102, 0.5)" : "rgba(34, 34, 34, 0.5)"}}><Typography>{props.emoji} {props.numReactions}</Typography></Button>)}
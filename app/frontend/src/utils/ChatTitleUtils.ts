import { IChatModel } from "../models/models";

export function getChatDisplayName(
  chat: IChatModel | null,
  currentUsername: string | undefined,
): string {
  if (!chat) return "";

  return chat.usernames.filter((name) => name !== currentUsername).join(", ");
}

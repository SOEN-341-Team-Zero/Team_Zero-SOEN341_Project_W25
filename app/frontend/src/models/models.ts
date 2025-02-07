export type ITeamModel = {
  team_id: number;
  team_name: string;
  channels?: IChannelModel[];
};
export type IChannelModel = {
  team_id: number;
  id: number;
  channel_name: string;
};
export type IUserModel = {
  user_id: number;
  username: string;
  isAdmin: boolean;
};

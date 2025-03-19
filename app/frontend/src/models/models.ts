enum Activity {
  Online = "Online",
  Away = "Away",
  Offline = "Offline"
}
export type ITeamModel = {
  team_id: number;
  team_name: string;
  channels?: IChannelModel[];
};
export class IChannelModel {
  team_id: number;
  id: number;
  channel_name: string;
  pub: boolean;
  constructor(team_id: number, id: number, channel_name: string, pub: boolean = false) {
    this.team_id = team_id;
    this.id = id;
    this.channel_name = channel_name;
    this.pub = pub;
  }
}
export type IUserModel = {
  user_id: number;
  username: string;
  isAdmin?: boolean;
  activity: Activity;
};

export type IChannelMessageModel = {
  senderId: number;
  username: string;
  message: string;
  sentAt: string;
  replyToId?: number; 
  replyToUsername?: string; 
  replyToMessage?: string;
};

export type IDirectMessageModel = {
  message_content: string;
  receiver_id: number;
  sender_id: number;
};

export type IDMChannelModel = {
  dm_id: number;
  otherUser: IUserModel;
  messages: IDirectMessageModel[];
};

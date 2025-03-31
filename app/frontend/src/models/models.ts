export enum UserActivity {
  Online = "Online",
  Away = "Away",
  Offline = "Offline",
}

export type StoryType = "image" | "video";

export type ITeamModel = {
  team_id: number;
  team_name: string;
  channels?: IChannelModel[];
};
export class IChannelModel {
  team_id: number;
  id: number;
  channel_name: string;
  is_public: boolean;
  owner_id?: number;
  constructor(
    team_id: number,
    id: number,
    channel_name: string,
    is_public: boolean = false,
    owner_id?: number,
  ) {
    this.team_id = team_id;
    this.id = id;
    this.channel_name = channel_name;
    this.is_public = is_public;
    this.owner_id = owner_id;
  }
}
export type IUserModel = {
  user_id: number;
  username: string;
  isAdmin?: boolean;
  activity: string;
};

export type IChannelMessageModel = {
  senderId: number;
  username: string;
  message: string;
  sentAt: string;
  replyToId?: number;
  replyToUsername?: string;
  replyToMessage?: string;
  reactions?: string[];
  reactionUsers?: IUserModel[];
  voiceNote?: Blob;
};

export type IDirectMessageModel = {
  message_content: string;
  receiver_id: number;
  sender_id: number;
};

export type IDMChannelModel = {
  dm_id: number;
  otherUser: IUserModel;
};

export type IRequestModel = {
  request_id: number;
  requester_id: number;
  requester_name: string;
  recipient_id: number;
  channel_id: number;
  channel_name: string;
  team_name: string;
  request_type: "join" | "invite";
  created_at?: string;
};

export type IStoryModel = {
  story_id: number;
  user_id: number;
  username: string;
  url: string; // url to the story content (image, video, etc.)
  fileType: StoryType;
  created_at?: string;
};

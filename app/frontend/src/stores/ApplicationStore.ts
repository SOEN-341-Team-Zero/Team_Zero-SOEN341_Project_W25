import { create } from "zustand";
import {
  IChannelModel,
  IChatModel,
  ITeamModel,
  IUserModel,
} from "../models/models";
import wretch from "wretch";

export enum ViewModes {
  Channel = "channel",
  DirectMessage = "dm",
}

type ApplicationState = {
  teams: ITeamModel[];
  channels: IChannelModel[];
  chats: IChatModel[];
  selectedTeam: ITeamModel | null;
  selectedChannel: IChannelModel | null;
  selectedChat: IChatModel | null;

  viewMode: "channel" | "dm";

  setTeams: (teams: ITeamModel[]) => void;
  setChannels: (channels: IChannelModel[]) => void;
  setChats: (chats: IChatModel[]) => void;
  setSelectedTeam: (team: ITeamModel) => void;
  setSelectedChannel: (channel: IChannelModel) => void;
  setSelectedChat: (Chat: IChatModel) => void;
  setViewMode: (viewMode: ViewModes) => void;

  refetchApplicationState: () => void;
};

export const useApplicationStore = create<ApplicationState>()((set) => ({
  teams: [],
  channels: [],
  chats: [],
  selectedTeam: null,
  selectedChannel: null,
  selectedChat: null,
  viewMode: ViewModes.Channel,

  setTeams: (teams: ITeamModel[]) => {
    set({ teams: teams });
  },

  setChannels: (channels: IChannelModel[]) => {
    set({ channels: channels });
  },
  setChats: (chats: IChatModel[]) => {
    set({ chats: chats });
  },

  setSelectedTeam: (team: ITeamModel) => {
    set({ selectedTeam: team });
  },
  setSelectedChannel: (channel: IChannelModel) => {
    set({ selectedChannel: channel });
  },
  setSelectedChat: (chat: IChatModel) => {
    set({ selectedChat: chat });
  },

  setViewMode: (viewMode: ViewModes) => {
    set((state) => {
      if (state.viewMode !== viewMode) {
        return { viewMode: viewMode };
      }
      return state;
    });
  },

  refetchApplicationState: () => {
    wretch(`http://localhost:3001/api/home/index`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .get()
      .json((res: { user: IUserModel; teams: ITeamModel[] }) => {
        set({
          teams: res.teams.map((team: any) => ({
            team_id: team.team_id,
            team_name: team.team_name,
          })),
          channels: res.teams.flatMap((team: any) =>
            team.channels.map((channel: any) => ({
              ...channel,
              team_id: team.team_id,
            })),
          ),
        });
      })
      .catch((err) => console.error(err));
  },
}));

import { create } from "zustand";
import {
  IChannelModel,
  IDMChannelModel,
  ITeamModel,
  IUserModel,
} from "../models/models";
import wretch from "wretch";

export enum ViewModes {
  Team = "team",
  DirectMessage = "dm",
}

type ApplicationState = {
  teams: ITeamModel[];
  channels: IChannelModel[];
  dmChannels: IDMChannelModel[];
  selectedTeam: ITeamModel | null;
  selectedChannel: IChannelModel | null;
  selectedDMChannel: IDMChannelModel | null;

  viewMode: "team" | "dm";

  setTeams: (teams: ITeamModel[]) => void;
  setChannels: (channels: IChannelModel[]) => void;
  setDMChannels: (chats: IDMChannelModel[]) => void;
  setSelectedTeam: (team: ITeamModel) => void;
  setSelectedChannel: (channel: IChannelModel) => void;
  setSelectedDMChannel: (Chat: IDMChannelModel) => void;
  setViewMode: (viewMode: ViewModes) => void;

  refetchTeamChannelsState: () => void;
  refetchDMChannelsState: () => void;
};

export const useApplicationStore = create<ApplicationState>()((set) => ({
  teams: [],
  channels: [],
  dmChannels: [],
  selectedTeam: null,
  selectedChannel: null,
  selectedDMChannel: null,
  viewMode: ViewModes.Team,

  setTeams: (teams: ITeamModel[]) => {
    set({ teams: teams });
  },

  setChannels: (channels: IChannelModel[]) => {
    set({ channels: channels });
  },
  setDMChannels: (dmChannels: IDMChannelModel[]) => {
    set({ dmChannels: dmChannels });
  },

  setSelectedTeam: (team: ITeamModel) => {
    set({ selectedTeam: team });
  },
  setSelectedChannel: (channel: IChannelModel) => {
    set({ selectedChannel: channel });
  },
  setSelectedDMChannel: (dmChannel: IDMChannelModel) => {
    set({ selectedDMChannel: dmChannel });
  },

  setViewMode: (viewMode: ViewModes) => {
    set((state) => {
      if (state.viewMode !== viewMode) {
        if (viewMode === ViewModes.DirectMessage) {
          state.refetchDMChannelsState();
        } else {
          state.refetchTeamChannelsState();
        }
        return { viewMode: viewMode };
      }
      return state;
    });
  },

  refetchTeamChannelsState: () => {
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

  refetchDMChannelsState: () => {
    wretch(`http://localhost:3001/api/chat/dm`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .get()
      .json((res: { dms: IDMChannelModel[] }) => {
        set({ dmChannels: res.dms });
      })
      .catch((err) => console.error(err));
  },
}));

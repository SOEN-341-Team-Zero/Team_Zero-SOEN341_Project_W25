import { create } from "zustand";
import {
  IChannelModel,
  IDMChannelModel,
  ITeamModel,
  IUserModel,
} from "../models/models";
import wretch from "wretch";
import { API_URL } from "../utils/FetchUtils";

export enum ViewModes {
  Team = "team",
  DirectMessage = "dm",
  Dashboard = "dashboard",
}

type ApplicationState = {
  teams: ITeamModel[];
  channels: IChannelModel[];
  dmChannels: IDMChannelModel[];
  selectedTeam: ITeamModel | null;
  selectedChannel: IChannelModel | null;
  selectedDMChannel: IDMChannelModel | null;

  viewMode: ViewModes;

  setTeams: (teams: ITeamModel[]) => void;
  setChannels: (channels: IChannelModel[]) => void;
  setDMChannels: (chats: IDMChannelModel[]) => void;
  setSelectedTeam: (team: ITeamModel) => void;
  setSelectedChannel: (channel: IChannelModel | null) => void;
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
  viewMode: ViewModes.Dashboard,

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
  setSelectedChannel: (channel: IChannelModel | null) => {
    set({ selectedChannel: channel });
  },
  setSelectedDMChannel: (dmChannel: IDMChannelModel) => {
    set({ selectedDMChannel: dmChannel });
  },

  setViewMode: (viewMode: ViewModes) => {
    set((state) => {
      if (state.viewMode !== viewMode) {
        switch (viewMode) {
          case ViewModes.DirectMessage:
            state.refetchDMChannelsState();
            break;
          case ViewModes.Team:
            state.refetchTeamChannelsState();
            break;
          case ViewModes.Dashboard:
            // dashboard state is managed by the components
            break;
        }
        return { viewMode: viewMode };
      }
      return state;
    });
  },

  refetchTeamChannelsState: () => {
    wretch(`${API_URL}/api/home/index`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .get()
      .json((res: { user: IUserModel; teams: ITeamModel[] }) => {
        set({
          teams: res.teams.map((team: any) => ({
            team_id: team.team_id,
            team_name: team.team_name,
          })),
          channels: res.teams.flatMap(teamMapping),
        });
      })
      .catch((err) => console.error(err));
  },

  refetchDMChannelsState: () => {
    wretch(`${API_URL}/api/home/dmlist`)
      .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
      .get()
      .json((res: { dmChannels: IDMChannelModel[] }) => {
        set({ dmChannels: res.dmChannels });
      })
      .catch((err) => console.error(err));
  },
}));

const teamMapping = (team: any) => {
  return team.channels.map((channel: any) => ({
    ...channel,
    team_id: team.team_id,
  }));
};

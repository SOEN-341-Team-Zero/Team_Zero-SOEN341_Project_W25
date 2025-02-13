import { create } from "zustand";
import { IChannelModel, ITeamModel, IUserModel } from "../models/models";
import wretch from "wretch";

type ApplicationState = {
  teams: ITeamModel[];
  channels: IChannelModel[];
  selectedTeam: ITeamModel | null;
  selectedChannel: IChannelModel | null;

  setTeams: (teams: ITeamModel[]) => void;
  setChannels: (channels: IChannelModel[]) => void;
  setSelectedTeam: (team: ITeamModel) => void;
  setSelectedChannel: (channel: IChannelModel) => void;

  refetchApplicationState: () => void;
};

export const useApplicationStore = create<ApplicationState>()((set) => ({
  teams: [],
  channels: [],
  selectedTeam: null,
  selectedChannel: null,

  setTeams: (teams: ITeamModel[]) => {
    set({ teams: teams });
  },

  setChannels: (channels: IChannelModel[]) => {
    set({ channels: channels });
  },

  setSelectedTeam: (team: ITeamModel) => {
    set({ selectedTeam: team });
  },
  setSelectedChannel: (channel: IChannelModel) => {
    set({ selectedChannel: channel });
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

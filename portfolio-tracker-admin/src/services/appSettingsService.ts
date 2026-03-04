import api from './api';

export interface AppSettings {
  showPortfolioValue: boolean;
}

const appSettingsService = {
  getSettings: async (): Promise<AppSettings> => {
    const response = await api.get('/app-settings');
    return response.data.data;
  },

  updateSettings: async (settings: Partial<AppSettings>): Promise<AppSettings> => {
    const response = await api.patch('/app-settings', settings);
    return response.data.data;
  },
};

export default appSettingsService;

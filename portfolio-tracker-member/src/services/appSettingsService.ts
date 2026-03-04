import api from './api';

export interface AppSettings {
  showPortfolioValue: boolean;
}

const appSettingsService = {
  getSettings: async (): Promise<AppSettings> => {
    const response = await api.get('/app-settings');
    return response.data.data;
  },
};

export default appSettingsService;

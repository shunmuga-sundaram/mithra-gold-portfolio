import AppSettingsRepository from '../../models/repositories/AppSettingsRepository';
import { IAppSettings } from '../../models/entities/AppSettings';

/**
 * APP SETTINGS SERVICE
 *
 * Business logic for global application settings.
 */

export class AppSettingsService {
    /**
     * Get current app settings
     */
    static async getSettings(): Promise<IAppSettings> {
        try {
            return await AppSettingsRepository.getSettings();
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve settings');
        }
    }

    /**
     * Update app settings
     */
    static async updateSettings(
        data: Partial<{ showPortfolioValue: boolean }>
    ): Promise<IAppSettings> {
        try {
            return await AppSettingsRepository.updateSettings(data);
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update settings');
        }
    }
}

export default AppSettingsService;

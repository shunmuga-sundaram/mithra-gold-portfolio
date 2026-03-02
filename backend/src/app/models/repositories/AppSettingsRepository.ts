import AppSettings, { IAppSettings } from '../entities/AppSettings';

/**
 * APP SETTINGS REPOSITORY
 *
 * Singleton pattern — always one document in the collection.
 * getSettings() creates it with defaults if it doesn't exist yet.
 */

export class AppSettingsRepository {
    /**
     * Get the global app settings.
     * Creates the document with defaults if it doesn't exist.
     */
    static async getSettings(): Promise<IAppSettings> {
        let settings = await AppSettings.findOne();

        if (!settings) {
            settings = await AppSettings.create({ showPortfolioValue: true });
        }

        return settings;
    }

    /**
     * Update the global app settings.
     */
    static async updateSettings(
        data: Partial<{ showPortfolioValue: boolean }>
    ): Promise<IAppSettings> {
        let settings = await AppSettings.findOne();

        if (!settings) {
            settings = await AppSettings.create({ showPortfolioValue: true, ...data });
        } else {
            Object.assign(settings, data);
            await settings.save();
        }

        return settings;
    }
}

export default AppSettingsRepository;

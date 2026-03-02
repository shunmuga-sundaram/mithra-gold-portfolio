import { Request, Response, NextFunction } from 'express';
import AppSettingsService from '../../services/app-settings/app-settings-service';

/**
 * APP SETTINGS CONTROLLER
 *
 * GET  /app-settings        - Public (member portal needs this without admin auth)
 * PATCH /app-settings       - Admin only
 */

export class AppSettingsController {
    /**
     * GET /app-settings
     * Returns the current global app settings
     */
    static async getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const settings = await AppSettingsService.getSettings();
            res.status(200).json({ success: true, data: settings });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /app-settings
     * Updates global app settings (admin only)
     */
    static async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { showPortfolioValue } = req.body;
            const updated = await AppSettingsService.updateSettings({ showPortfolioValue });
            res.status(200).json({ success: true, message: 'Settings updated successfully', data: updated });
        } catch (error) {
            next(error);
        }
    }
}

export default AppSettingsController;

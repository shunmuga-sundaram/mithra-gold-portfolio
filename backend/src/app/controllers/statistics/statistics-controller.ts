import { Request, Response, NextFunction } from 'express';
import { StatisticsService } from '../../services/statistics/statistics-service';
import { ApiResponse } from '../../helpers/api-response';

/**
 * Statistics Controller
 *
 * Handles HTTP requests for dashboard statistics
 */

export class StatisticsController {
    /**
     * Get dashboard statistics
     *
     * GET /statistics/dashboard
     */
    static async getDashboardStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const statistics = await StatisticsService.getDashboardStatistics();

            const response = new ApiResponse(200, statistics, 'Dashboard statistics retrieved successfully');
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
}

import { Request, Response, NextFunction } from 'express';
import GoldRateService from '../../services/gold-rate/gold-rate-service';
import { CreateGoldRateDto } from '../../dtos/gold-rate.dto';

/**
 * GOLD RATE CONTROLLER
 *
 * Handles HTTP requests for gold rate operations
 */

export class GoldRateController {
    /**
     * GET /gold-rates/active
     * Get the current active gold rate
     */
    static async getActiveRate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const rate = await GoldRateService.getActiveRate();
            res.status(200).json(rate);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /gold-rates
     * Get all gold rates with pagination
     */
    static async getAllRates(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'createdAt';
            const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

            const result = await GoldRateService.getAllRates({
                page,
                limit,
                sortBy,
                sortOrder,
            });

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /gold-rates/:id
     * Get a specific gold rate by ID
     */
    static async getRateById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const rate = await GoldRateService.getRateById(id);
            res.status(200).json(rate);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /gold-rates
     * Create a new gold rate
     * Automatically deactivates all existing rates
     */
    static async createRate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const rateData: CreateGoldRateDto = req.body;
            const adminId = req.user?.id;

            if (!adminId) {
                throw new Error('Admin ID not found in token');
            }

            const rate = await GoldRateService.createRate(rateData, adminId);
            res.status(201).json(rate);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /gold-rates/statistics
     * Get gold rate statistics
     */
    static async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const stats = await GoldRateService.getStatistics();
            res.status(200).json(stats);
        } catch (error) {
            next(error);
        }
    }
}

export default GoldRateController;

import { Request, Response, NextFunction } from 'express';
import TradeService from '../../services/trade/trade-service';
import { CreateTradeDto, UpdateTradeStatusDto } from '../../dtos/trade.dto';
import { TradeType, TradeStatus } from '../../models/entities/Trade';

/**
 * TRADE CONTROLLER
 *
 * Handles HTTP requests for trade operations
 */

export class TradeController {
    /**
     * GET /trades
     * Get all trades with filters (admin only)
     */
    static async getAllTrades(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'createdAt';
            const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
            const memberId = req.query.memberId as string;
            const tradeType = req.query.tradeType as TradeType;
            const status = req.query.status as TradeStatus;

            const result = await TradeService.getAllTrades({
                page,
                limit,
                sortBy,
                sortOrder,
                memberId,
                tradeType,
                status,
            });

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /trades/member/:memberId
     * Get trades for a specific member (admin only)
     */
    static async getMemberTrades(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { memberId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'createdAt';
            const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

            const result = await TradeService.getMemberTrades(memberId, {
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
     * GET /trades/my-trades
     * Get trades for the currently logged-in member
     */
    static async getMyTrades(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const memberId = req.user?.id;

            if (!memberId) {
                throw new Error('Member ID not found in token');
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 100; // Show more trades for members
            const sortBy = (req.query.sortBy as string) || 'createdAt';
            const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

            const result = await TradeService.getMemberTrades(memberId, {
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
     * GET /trades/:id
     * Get specific trade by ID
     */
    static async getTradeById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const trade = await TradeService.getTradeById(id);
            res.status(200).json(trade);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /trades
     * Create a new trade
     * Admin: Can create BUY/SELL trades (COMPLETED status)
     * Member: Can only create SELL trades (PENDING status)
     */
    static async createTrade(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tradeData: CreateTradeDto = req.body;
            const userId = req.user?.id;
            const userRole = req.user?.role;

            if (!userId) {
                throw new Error('User ID not found in token');
            }

            const isAdmin = userRole === 'admin' || userRole === 'super_admin';

            // Validate BUY trade permissions
            if (tradeData.tradeType === TradeType.BUY && !isAdmin) {
                throw new Error('Only admins can create BUY trades');
            }

            const trade = await TradeService.createTrade(tradeData, userId, isAdmin);
            res.status(201).json(trade);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /trades/:id/status
     * Update trade status (approve/reject)
     * Admin only
     */
    static async updateTradeStatus(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;
            const statusData: UpdateTradeStatusDto = req.body;
            const adminId = req.user?.id;

            if (!adminId) {
                throw new Error('Admin ID not found in token');
            }

            const trade = await TradeService.updateTradeStatus(id, statusData, adminId);
            res.status(200).json(trade);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /trades/statistics
     * Get trade statistics
     */
    static async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const memberId = req.query.memberId as string;
            const stats = await TradeService.getStatistics(memberId);
            res.status(200).json(stats);
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /trades/:id/cancel
     * Cancel a COMPLETED BUY trade
     * Admin only
     */
    static async cancelTrade(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const adminId = req.user?.id;

            if (!adminId) {
                throw new Error('Admin ID not found in token');
            }

            const trade = await TradeService.cancelTrade(id, adminId);
            res.status(200).json(trade);
        } catch (error) {
            next(error);
        }
    }
}

export default TradeController;

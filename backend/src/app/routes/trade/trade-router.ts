import { Router } from 'express';
import { ApiRouter } from '../../helpers/api-router';
import { TradeController } from '../../controllers/trade/trade-controller';
import { BodyValidationMiddleware } from '../../middlewares/validation-middleware';
import { CreateTradeDto, UpdateTradeStatusDto } from '../../dtos/trade.dto';
import { AuthenticationMiddleware } from '../../middlewares/authentication-middleware';
import { RequireAdmin } from '../../middlewares/authorization-middleware';

/**
 * TRADE ROUTER
 *
 * Routes for trade management
 *
 * Permissions:
 * - GET /trades: Admin only (view all trades)
 * - POST /trades: Authenticated (admin can create BUY/SELL, members can create SELL only)
 * - PATCH /trades/:id/status: Admin only (approve/reject trades)
 */

export class TradeRouter implements ApiRouter {
    public readonly baseUrl = '/trades';
    private router: Router;

    public constructor() {
        this.router = Router();
        this.initRoutes();
    }

    public get Router(): Router {
        return this.router;
    }

    private initRoutes(): void {
        // Apply authentication to all routes
        this.router.use(AuthenticationMiddleware);

        // Specific routes BEFORE parameterized routes
        // GET /trades/statistics - Admin only
        this.router.get('/statistics', RequireAdmin, TradeController.getStatistics);

        // GET /trades/my-trades - Authenticated member can view their own trades
        this.router.get('/my-trades', TradeController.getMyTrades);

        // GET /trades/member/:memberId - Admin only (view member's trades)
        this.router.get('/member/:memberId', RequireAdmin, TradeController.getMemberTrades);

        // GET /trades - Admin only (view all trades)
        this.router.get('/', RequireAdmin, TradeController.getAllTrades);

        // POST /trades - Authenticated (members can create SELL, admins can create BUY/SELL)
        this.router.post(
            '/',
            BodyValidationMiddleware(CreateTradeDto),
            TradeController.createTrade
        );

        // PATCH /trades/:id/status - Admin only (approve/reject)
        this.router.patch(
            '/:id/status',
            RequireAdmin,
            BodyValidationMiddleware(UpdateTradeStatusDto),
            TradeController.updateTradeStatus
        );

        // DELETE /trades/:id/cancel - Admin only (cancel COMPLETED BUY trade)
        this.router.delete('/:id/cancel', RequireAdmin, TradeController.cancelTrade);

        // GET /trades/:id - Admin only (view specific trade)
        this.router.get('/:id', RequireAdmin, TradeController.getTradeById);
    }
}

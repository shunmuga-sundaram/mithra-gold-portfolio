import { Router } from 'express';
import { ApiRouter } from '../../helpers/api-router';
import { GoldRateController } from '../../controllers/gold-rate/gold-rate-controller';
import { BodyValidationMiddleware } from '../../middlewares/validation-middleware';
import { CreateGoldRateDto } from '../../dtos/gold-rate.dto';
import { AuthenticationMiddleware } from '../../middlewares/authentication-middleware';
import { RequireAdmin } from '../../middlewares/authorization-middleware';

/**
 * GOLD RATE ROUTER
 *
 * Defines routes for gold rate management
 * GET routes: Anyone authenticated (members need to see rates)
 * POST routes: Admin only (only admins can set rates)
 */

export class GoldRateRouter implements ApiRouter {
    public readonly baseUrl = '/gold-rates';
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
        // GET /gold-rates/active - Get current active rate
        this.router.get('/active', GoldRateController.getActiveRate);

        // GET /gold-rates/statistics - Get statistics
        this.router.get('/statistics', GoldRateController.getStatistics);

        // GET /gold-rates - Get all rates (paginated)
        this.router.get('/', GoldRateController.getAllRates);

        // POST /gold-rates - Create new rate (admin only)
        this.router.post(
            '/',
            RequireAdmin,
            BodyValidationMiddleware(CreateGoldRateDto),
            GoldRateController.createRate
        );

        // GET /gold-rates/:id - Get specific rate
        this.router.get('/:id', GoldRateController.getRateById);
    }
}

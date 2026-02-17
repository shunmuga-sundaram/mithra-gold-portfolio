import { Router } from 'express';
import { ApiRouter } from '../../helpers/api-router';
import { StatisticsController } from '../../controllers/statistics/statistics-controller';
import { AuthenticationMiddleware } from '../../middlewares/authentication-middleware';
import { RequireAdmin } from '../../middlewares/authorization-middleware';

/**
 * STATISTICS ROUTER
 *
 * Defines routes for statistics and analytics
 * All routes require admin authentication
 */

export class StatisticsRouter implements ApiRouter {
    public readonly baseUrl = '/statistics';
    private router: Router;

    public constructor() {
        this.router = Router();
        this.initRoutes();
    }

    public get Router(): Router {
        return this.router;
    }

    private initRoutes(): void {
        // Apply authentication and admin authorization to all routes
        this.router.use(AuthenticationMiddleware);
        this.router.use(RequireAdmin);

        // GET /statistics/dashboard - Get dashboard statistics
        this.router.get('/dashboard', StatisticsController.getDashboardStatistics);
    }
}

import express from 'express';
import helmet from 'helmet';
import { AddressInfo } from 'net';
import { Server } from 'http';
import {
    routeErrorHandler,
    unhandledErrorHandler,
    apiErrorHandler
} from './middlewares';
import { corsMiddleware } from './middlewares/cors-middleware';
import { join } from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import { apiDefintion } from './config/swagger-config';
import { route } from './routes';
// import { DomainRestrictedException } from './error/domain-restricted-exception';

export class App {
    private app: express.Express;
    public constructor() {
        this.app = express();
        this.init();
        this.initRoutes();
        this.initErrorMiddlewares();
    }

    public listen(): Server {
        const server = this.app.listen(
            parseInt(process.env.APP_PORT) || 3000,
            process.env.APP_URL || 'localhost',
            () => {
                const address = (server.address() as AddressInfo).address;
                const port = (server.address() as AddressInfo).port;
                console.log(
                    `Application running on url 📡: http://${address}:${port}/`
                );
                console.log(
                    `Api documentation running on url 📡: http://${address}:${port}/api-docs/`
                );
            }
        );
        return server;
    }

    private init() {
        this.app.use(helmet());

        // Enable CORS for frontend applications
        this.app.use(corsMiddleware);

        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        const apiDocsPath = join(__dirname, '../api-docs');
        this.app.use('/api-docs', express.static(apiDocsPath));
        this.app.get('/swagger.json', (request, response, next) => {
            try {
                response.setHeader('Content-Type', 'application/json');
                const swaggerSpec = swaggerJsdoc({
                    swaggerDefinition: {
                        ...apiDefintion,
                        servers: [
                            {
                                url: `http://${process.env.SWAGGER_DOMAIN}:${process.env.SWAGGER_PORT}`
                            }
                        ]
                    },
                    apis: [join(__dirname, './routes/**/*.{js,ts}')]
                });
                response.send(swaggerSpec);
            } catch (e) {
                next(e);
            }
        });
    }

    private initRoutes() {
        this.app.use(route.Router);
        this.app.use(routeErrorHandler);
    }

    private initErrorMiddlewares() {
        this.app.use(apiErrorHandler);
        this.app.use(unhandledErrorHandler);
    }
}

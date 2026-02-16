import express from 'express';
import helmet from 'helmet';
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
        const port = parseInt(process.env.APP_PORT || '3000');
        const host = process.env.APP_HOST || '0.0.0.0';

        const server = this.app.listen(port, host, () => {
            const addr = server.address();
            if (addr && typeof addr !== 'string') {
                const address = addr.address === '::' ? 'localhost' : addr.address;
                const displayAddress = address === '0.0.0.0' ? 'localhost' : address;
                console.log('\n🚀 Server started successfully!');
                console.log(`📡 Application running on: http://${displayAddress}:${addr.port}/`);
                console.log(`📚 API documentation: http://${displayAddress}:${addr.port}/api-docs/`);
                console.log('');
            }
        });

        server.on('error', (error: NodeJS.ErrnoException) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Error: Port ${port} is already in use`);
                console.error('   Please stop the other process or use a different port');
                process.exit(1);
            } else if (error.code === 'EACCES') {
                console.error(`❌ Error: Permission denied to bind to port ${port}`);
                console.error('   Try using a port number above 1024');
                process.exit(1);
            } else {
                console.error('❌ Server error:', error);
                process.exit(1);
            }
        });

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

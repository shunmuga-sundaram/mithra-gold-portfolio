/* eslint-disable @typescript-eslint/unbound-method */
import { Router } from 'express';
import { SampleController } from 'src/app/controllers/sample/sample-contoller';
import { ApiRouter } from '../helpers/api-router';

export class SampleRouter implements ApiRouter {
    public readonly baseUrl = '/sample';
    private router: Router;
    public constructor(private sampleController: SampleController) {
        this.router = Router();
        this.initRoutes();
    }

    public get Router(): Router {
        return this.router;
    }

    private initRoutes(): void {
    }
}

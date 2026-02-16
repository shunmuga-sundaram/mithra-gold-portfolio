import { AppRouter } from './app-router';
import { AppController } from '../controllers';
import { AppService } from '../services';
import { SampleRouter } from './sample-router';
import { SampleController } from '../controllers/sample/sample-contoller';
import { RootRouter } from './root-router';
import { AuthRouter } from './auth';
import { MemberRouter } from './member/member-router';

export const route = new RootRouter(
    new SampleRouter(new SampleController()),
    new AppRouter(new AppController(new AppService())),
    new AuthRouter(),
    new MemberRouter()
);

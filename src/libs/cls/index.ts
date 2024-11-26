import { DynamicModule } from "@nestjs/common";
import { ClsModule as NestClsModule, ClsStore } from "nestjs-cls"
import { CryptoUtils } from 'me-utils';

export interface AppClsStore extends ClsStore {
    traceId: string;
}

export const ClsModule: DynamicModule = NestClsModule.forRoot({
    global: true,
    middleware: {
        mount: true,
        setup: (cls, req: Request, res: Response) => {
            //traceId
            cls.set('traceId', CryptoUtils.uuid({ lowerCase: true }));
        }
    },
});
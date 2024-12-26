import { DynamicModule } from '@nestjs/common';
import { CryptoUtils } from 'me-utils';
import { ClsStore, ClsModule as NestClsModule } from 'nestjs-cls';

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
		},
	},
});

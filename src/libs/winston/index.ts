import { Global, Logger, Module } from '@nestjs/common';
import { WinstonModule as NestWinstonModule } from 'nest-winston';
import * as winston from 'winston';

import { isDevelopment, local } from '@libs/utils';
import { NestLikeFormat } from './nest-format';

export function getWinston(appName: string) {
	return NestWinstonModule.createLogger({
		level: local ? 'debug' : isDevelopment ? 'verbose' : 'info',
		format: winston.format.combine(...NestLikeFormat(appName)),
		transports: [new winston.transports.Console()],
	});
}

// export { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
// export const WinstonModule: DynamicModule = NestWinstonModule.forRoot({
// 	level: isDevelopment ? 'debug' : 'info',
// 	format: winston.format.combine(...NestLikeFormat('Semi')),
// 	transports: [new winston.transports.Console()],
// });

//WinstonModule模块
@Global()
@Module({
	providers: [Logger],
	exports: [Logger],
})
export class WinstonModule {}

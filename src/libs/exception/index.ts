import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { AppExceptionFilter } from './filter';

//exports
export * from './define';

//Exception模块
@Global()
@Module({
	providers: [{ provide: APP_FILTER, useClass: AppExceptionFilter }],
})
export class ExceptionModule {}

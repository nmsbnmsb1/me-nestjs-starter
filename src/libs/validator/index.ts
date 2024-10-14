import { flatten } from 'lodash';
import { APP_PIPE } from '@nestjs/core';
import { HttpStatus, ValidationPipe, Global, Module } from '@nestjs/common';
import { AppException } from '@libs/exception';

export * from './decorator';
export * as Validators from './extends';

const isDevelopment = process.env.NODE_ENV !== 'production';

//------------------------------------------
@Global()
@Module({
	providers: [
		{
			provide: APP_PIPE,
			useFactory: () =>
				new ValidationPipe({
					whitelist: true,
					//disableErrorMessages: true,
					stopAtFirstError: !isDevelopment,
					transform: true,
					exceptionFactory: (errors) =>
						new AppException({
							http_status: HttpStatus.BAD_REQUEST,
							id: 'invalid_params',
							description: (() => {
								//console.log(errors);
								let descriptions = flatten(
									errors.filter((item) => !!item.constraints).map((item) => Object.values(item.constraints as any))
								);
								return !isDevelopment ? descriptions[0] : descriptions;
							})(),
						}),
				}),
		},
	],
})
export class ValidatorModule {}

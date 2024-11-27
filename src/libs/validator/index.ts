import { APP_PIPE } from '@nestjs/core';
import { HttpStatus, ValidationPipe, Global, Module } from '@nestjs/common';
import { isDevelopment } from '@libs/utils';

export * from './decorator';
export * as Validators from './extends';

/**
 * Converts a camelCase or PascalCase string to snake_case.
 * @param {string} input - The camelCase or PascalCase string.
 * @returns {string} - The snake_case string.
 */
// function toSnakeCase(input) {
// 	return input
// 		.replace(/([a-z])([A-Z])/g, '$1_$2') // Insert _ between lowercase and uppercase letters
// 		.replace(/([A-Z])([A-Z][a-z])/g, '$1_$2') // Handle consecutive uppercase letters
// 		.toLowerCase(); // Convert the entire string to lowercase
// }

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
					exceptionFactory: (errors) => {
						let descriptions = []
						for (let e of errors) {
							if (!e.constraints) continue;
							for (let key in e.constraints) {
								let message = e.constraints[key]
								//如果是自定义信息
								if (message.startsWith('#')) {
									descriptions.push(`${e.property}.${message.substring(1)}`)
								} else {
									descriptions.push(`${e.property}.${key}`)
								}
							}
						}
						//
						let http_status = HttpStatus.BAD_REQUEST
						let id = 'invalid_param'
						let description = descriptions;
						//
						return { id, http_status, description }
					}
				}),
		},
	],
})
export class ValidatorModule { }

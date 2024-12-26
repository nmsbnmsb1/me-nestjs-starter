import { Global, Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

import { isDevelopment } from '@libs/utils';
import { getValidationExecption } from './utils';

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
						let descriptions = [];
						for (let e of errors) {
							if (e.constraints) {
								for (let key in e.constraints) {
									let message = e.constraints[key];
									if (message.startsWith('#')) {
										descriptions.push({ fieldName: e.property, message: message.substring(1) });
									} else {
										descriptions.push({ fieldName: e.property, message: key });
									}
								}
							}
						}
						//
						return getValidationExecption(descriptions);
					},
				}),
		},
	],
})
export class ValidatorModule {}

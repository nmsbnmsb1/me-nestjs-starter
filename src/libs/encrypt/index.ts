import { Global, Module } from '@nestjs/common';
import { JwtModule as NestJWTModule } from '@nestjs/jwt';

import { ConfigService } from '@libs/config';
import { JwtEncryptService } from './jwt';
import { PwdEncryptService } from './pwd';

//exports
export * from './jwt';
export * from './pwd';

//
@Global()
@Module({
	imports: [
		NestJWTModule.registerAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => {
				let { algorithm, secret, expiresIn } = configService.get('encrypt.jwt');
				return { secret, signOptions: { algorithm, expiresIn } };
			},
		}),
	],
	providers: [JwtEncryptService, PwdEncryptService],
	exports: [JwtEncryptService, PwdEncryptService],
})
export class EncryptModule {}

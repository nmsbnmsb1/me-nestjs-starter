import path from 'path';
import fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule as NestSwaggerModule } from '@nestjs/swagger';
//系统子模块
import { ConfigModule, ConfigService } from '@libs/config';
import { DBModule } from '@libs/db';
import { EncryptModule } from '@libs/encrypt';
import { ExceptionModule } from '@libs/exception';
import { ValidatorModule } from '@libs/validator';
//业务模块
import { PwdAuthModule } from '@modules/auth/pwd';
import { JWTAuthModule } from '@modules/auth/jwt';
import { UserModule } from '@modules/user';
//
import * as CDB from 'me-cache-db';

@Module({
	imports: [
		//系统模块
		ConfigModule,
		DBModule.forRoot(),
		EncryptModule,
		ExceptionModule,
		ValidatorModule,
		//业务模块
		PwdAuthModule,
		JWTAuthModule,
		UserModule,
	],
})
export class AppModule {}

//bootstrap
(async () => {
	let app = await NestFactory.create(AppModule, { cors: true, rawBody: true });
	let configService = app.get(ConfigService);
	//Swagger
	if (process.env.NODE_ENV === 'development') {
		let pkg = JSON.parse(fs.readFileSync(path.resolve('package.json')) as any);
		let options = new DocumentBuilder()
			.setTitle(pkg.name)
			.setDescription(pkg.description)
			.setVersion(pkg.version)
			.addBearerAuth()
			//
			.build();
		let document = NestSwaggerModule.createDocument(app, options);
		NestSwaggerModule.setup('api', app, document);
	}
	//me-cache-db
	{
		let config = configService.get('cdb');
		CDB.initCache(config.defaultCID, { ...config.cache }, config.expireMS);
	}
	//
	await app.listen(configService.get('port'));
})();

import fs from 'node:fs';
import path from 'node:path';

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule as NestSwaggerModule } from '@nestjs/swagger';
import * as CacheDB from 'me-cache-db';

//系统子模块
import { ClsModule } from '@libs/cls';
import { ConfigModule, ConfigService } from '@libs/config';
import { DBModule } from '@libs/db';
import { EncryptModule } from '@libs/encrypt';
import { ExceptionModule } from '@libs/exception';
import { ValidatorModule } from '@libs/validator';
import { WinstonModule, getWinston } from '@libs/winston';

//业务模块
import { JWTAuthModule } from '@modules/auth/jwt';
import { PwdAuthModule } from '@modules/auth/pwd';
import { UserModule } from '@modules/user';

@Module({
	imports: [
		//系统模块
		ConfigModule,
		WinstonModule,
		ClsModule,
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
	let app = await NestFactory.create(AppModule, {
		rawBody: true,
		//全局替换logger
		logger: getWinston('Nest'),
	});
	let configService = app.get(ConfigService);
	//enable-cros
	{
		app.enableCors({
			origin: '*', // 允许所有源（或指定的源）
			allowedHeaders: 'Content-Type,Authorization,Token',
			exposedHeaders: 'Token', // 允许客户端读取 Token 头
		});
	}
	//global-api-prefix
	{
		let apiPrefix = configService.get('apiPrefix');
		if (apiPrefix) {
			app.setGlobalPrefix(apiPrefix);
		}
	}
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
		let config = configService.get('cachedb');
		CacheDB.initCache(config.defaultCID, { ...config.cache }, config.expireMS);
	}
	//
	await app.listen(configService.get('port'));
})();

import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import baseConfig from '@config/config';
import { DBService, getSequelizeConfig } from './db.service';

//
export * as CacheDB from 'me-cache-db';
export class DBModule {
	public static forRoot(): DynamicModule {
		let imports = [];
		//导入所有的数据库
		for (let key in baseConfig.db) {
			if (key.startsWith('base_')) continue;
			if (baseConfig.db[key].matches) continue;
			//
			imports.push(
				SequelizeModule.forRootAsync({
					name: key,
					inject: [ConfigService],
					useFactory: (config: ConfigService) => getSequelizeConfig(key, config.get(`db.${key}`), config.get(`db`)),
				})
			);
		}
		//
		return {
			global: true,
			module: DBModule,
			imports,
			providers: [DBService],
			exports: [DBService],
		};
	}
}

import path from 'path';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import baseConfig from '@config/config';
import { DBService } from './db.service';

//
export * as CacheDB from 'me-cache-db';
export class DBModule {
	public static register(): DynamicModule {
		let imports = [];
		//导入所有的数据库
		for (let key in baseConfig.db) {
			if (key.startsWith('base_')) continue;
			//
			imports.push(
				SequelizeModule.forRootAsync({
					name: key,
					inject: [ConfigService],
					useFactory: (config: ConfigService) => {
						let dbConfig = config.get(`db.${key}`);
						let dbBaseConfig = config.get(`db.base_${dbConfig.dialect}`);
						let moduleConfig = {
							database: key,
							autoLoadModels: true,
							synchronize: true,
							repositoryMode: true,
							//通用基础配置
							...dbBaseConfig,
							//单独配置
							name: key,
							...dbConfig,
						};
						//其他
						if (dbConfig.dialect === 'sqlite') {
							if (!dbConfig.storage) {
								moduleConfig.storage = path.resolve(dbBaseConfig.storage, `${key}.sqlite`);
							}
						}
						//
						return moduleConfig;
					},
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

import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { merge } from 'lodash';

import baseConfig from '@config/config';

//导出服务
export { ConfigService } from '@nestjs/config';
//导出模块
export const ConfigModule = NestConfigModule.forRoot({
	isGlobal: true,
	ignoreEnvFile: true,
	load: [
		() => {
			let envConfig = {};
			try {
				envConfig = require(`../../config/config.${process.env.NODE_ENV}`).default;
			} catch (e) {}
			//
			return merge(baseConfig, envConfig);
		},
	],
});

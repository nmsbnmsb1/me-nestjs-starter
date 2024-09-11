import path from 'path';
import { JSONCache } from 'me-cache-db/lib/cache/json';

export default {
	apiPrefix: '',
	//配置
	port: 1234,
	//加密
	encrypt: {
		pwd: {
			//盐值迭代次数
			saltRounds: 10,
		},
		jwt: {
			algorithm: 'HS512',
			secret: '************',
			expiresIn: '100y',
		},
	},
	user: {
		cacheExpireMS: 3 * (24 * 60 * 60 * 1000),
	},
	//cdb
	cachedb: {
		defaultCID: 'json',
		cache: { [JSONCache.CID]: new JSONCache(path.resolve('runtime/cache')) },
		expireMS: 3 * (24 * 60 * 60 * 1000),
	},
	//db
	db: {
		//基础配置
		base_sqlite: {
			//logging: ['query'],
			storage: path.resolve('./dbs'),
		},
		//其他数据库
		sys: {
			dialect: 'sqlite',
		},
	},
};

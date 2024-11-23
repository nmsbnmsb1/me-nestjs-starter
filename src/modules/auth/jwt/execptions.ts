import { registerByMap } from '@libs/exception';

//注册错误信息
export const JWTExceptions = registerByMap({
	invalid_jwt: {
		http_status: 403,
		dev: 'Invalid JWT', pro: 'Unauthorized'
	},
	jwt_not_exists: {
		http_status: 403,
		dev: 'No JWT found in Headers', pro_key: 'invalid_jwt'
	},
	invalid_cache: {
		http_status: 403,
		dev: 'No CacheData for this JWT', pro_key: 'invalid_jwt'
	},
	jwt_not_match: {
		http_status: 403,
		dev: `Cached JWT doesn't match`, pro_key: 'invalid_jwt'
	},
	invalid_user_cache: {
		http_status: 403,
		dev: 'No CacheData for user', pro_key: 'invalid_jwt'
	},
});

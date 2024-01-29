import { registerByMap } from '@libs/exception';

//注册错误信息
export const JWTExceptions = registerByMap({
	jwt_not_exists: { http_status: 403, description: { dev: 'No JWT found in Headers', pro: 'Unauthorized' } },
	invalid_jwt: { http_status: 403, description: { dev: 'Invalid JWT', pro: 'Unauthorized' } },
	invalid_cache: { http_status: 403, description: { dev: 'No CacheData for this JWT', pro: 'Unauthorized' } },
	jwt_not_match: { http_status: 403, description: { dev: `Cached JWT doesn't match`, pro: 'Unauthorized' } },
	invalid_user_cache: { http_status: 403, description: { dev: 'No CacheData for user', pro: 'Unauthorized' } },
});

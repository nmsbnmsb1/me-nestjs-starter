import { registerByMap } from '@libs/exception';

//注册错误信息
export const JWTExceptions = registerByMap({
	invalid_jwt: { pro_id: 'unauthorized', http_status: 403, },
	jwt_not_exists: { pro_id: 'unauthorized', http_status: 403, },
	invalid_cache: { pro_id: 'unauthorized', http_status: 403, },
	jwt_not_match: { pro_id: 'unauthorized', http_status: 403, },
	invalid_user_cache: { pro_id: 'unauthorized', http_status: 403, },
});

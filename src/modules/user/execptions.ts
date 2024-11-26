import { registerByMap } from '@libs/exception';

//注册错误信息
export const UserExceptions = registerByMap({
	user_exists: {},
	invalid_user: {},
	user_not_exists: { pro_id: 'invalid_user' },
	invalid_password: { pro_id: 'invalid_user' },
});

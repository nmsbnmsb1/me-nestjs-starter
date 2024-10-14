import { registerByMap } from '@libs/exception';

//注册错误信息
export const UserExceptions = registerByMap({
	user_exists: 'User already exists',
	invalid_user: 'Invalid user',
	user_not_exists: { dev: 'User is not exists', pro_key: 'invalid_user' },
	invalid_password: { dev: 'Invalid password', pro_key: 'invalid_user' },
});

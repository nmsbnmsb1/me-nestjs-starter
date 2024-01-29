import { registerByMap } from '@libs/exception';

//注册错误信息
export const UserExceptions = registerByMap({
	user_exists: 'User already exists',
	user_not_exists: 'User is not exists',
	invalid_password: 'Invalid password',
});

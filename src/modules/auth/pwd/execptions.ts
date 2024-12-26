import { registerByMap } from '@libs/exception';

//注册错误信息
export const PwdAuthExceptions = registerByMap({
	invalid_user_pwd: {},
});

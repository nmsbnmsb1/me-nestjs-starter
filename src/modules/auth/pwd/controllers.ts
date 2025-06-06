import { Body, Controller, Post, Res } from '@nestjs/common';

import { isDevelopment } from '@libs/utils';
import { UserService } from '@modules/user/services/user';
import { LoginDTO, RegisterDTO } from './dtos';
import { PwdAuthExceptions } from './execptions';

@Controller('auth')
export class PwdAuthController {
	constructor(private readonly userService: UserService) {}

	@Post('registerByUsername')
	//@UseGuards(PwdRegisterGuard)
	async registerByUsername(@Body() registerDto: RegisterDTO) {
		//检查用户是否已存在
		await this.userService.getOne('username', registerDto.username, 'id', 'not_exists');
		//执行注册
		let user = await this.userService.register(registerDto);
		//返回注册信息
		return this.userService.fieldScheme.filterDataFields(user.dataValues, UserService.FieldSchemeCommon);
	}

	@Post('loginByUsername')
	//@UseGuards(PwdLoginGuard)
	async loginByUsername(@Body() loginDto: LoginDTO, @Res({ passthrough: true }) res) {
		let user: any;
		try {
			//检查用户是否已存在
			user = await this.userService.getOne('username', loginDto.username, UserService.FieldSchemeAll, 'exists', false);
			//检查密码是否相符
			await this.userService.checkPassword(loginDto.password, user);
		} catch (e) {
			if (isDevelopment) {
				throw e;
			}
			throw PwdAuthExceptions.invalid_user_pwd;
		}
		//执行登陆
		let { jwt, user: loginUser } = await this.userService.login(user);
		//jwt需要在header中返回
		res.header('token', jwt);
		//
		return this.userService.fieldScheme.filterDataFields(loginUser.dataValues, UserService.FieldSchemeCommon);
	}
}

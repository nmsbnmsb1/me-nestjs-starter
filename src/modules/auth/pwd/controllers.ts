import { Body, Controller, Post, Request, Res, UseGuards } from '@nestjs/common';
import { UserService } from '@modules/user/services/user';
import { PwdRegisterGuard, PwdLoginGuard } from './guards';
import { RegisterDTO } from './dtos';

@Controller('auth')
export class PwdAuthController {
	constructor(private readonly userService: UserService) {}

	@Post('registerByUsername')
	@UseGuards(PwdRegisterGuard)
	async registerByUsername(@Body() registerDto: RegisterDTO) {
		//执行注册
		let user = await this.userService.register(registerDto);
		//返回注册信息
		return this.userService.fieldScheme.filterDataFields(user.dataValues, UserService.FieldSchemeCommon);
	}

	@Post('loginByUsername')
	@UseGuards(PwdLoginGuard)
	async loginByUsername(@Request() req, @Res({ passthrough: true }) res) {
		//执行登陆
		let { jwt, user } = await this.userService.login(req.user);
		//jwt需要在header中返回
		res.header('token', jwt);
		//
		return this.userService.fieldScheme.filterDataFields(user.dataValues, UserService.FieldSchemeCommon);
	}
}

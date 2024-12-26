import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';

import { JWTAuthGuard } from '@modules/auth/jwt/guard';
import { UserService } from '@modules/user/services/user';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('data')
	@UseGuards(JWTAuthGuard)
	async data(@Request() req) {
		//返回用户信息
		return req.user.dataValues;
	}

	@Post('logout')
	@UseGuards(JWTAuthGuard)
	async logout(@Request() req) {
		await this.userService.delUserCache(req.user.uuid);
		return true;
	}
}

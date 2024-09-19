import { Controller, UseGuards, Request, Get, Post } from '@nestjs/common';
import { UserService } from '@modules/user/services/user';
import { JWTAuthGuard } from '@modules/auth/jwt/guard';

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

import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { UserService } from '@modules/user/services/user';
import { JWTAuthGuard } from '@modules/auth/jwt/guard';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post('test')
	@UseGuards(JWTAuthGuard)
	async test(@Request() req) {
		//
	}
}

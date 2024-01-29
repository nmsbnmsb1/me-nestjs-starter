import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserService } from '@modules/user/services/user';

@Injectable()
export class PwdRegisterGuard implements CanActivate {
	constructor(private userService: UserService) {}

	async canActivate(context: ExecutionContext) {
		let req = context.switchToHttp().getRequest();
		//检查用户名是否已存在
		await this.userService.dbGetByKV('username', req.body.username, 'not_exists');
		//
		return true;
	}
}

@Injectable()
export class PwdLoginGuard implements CanActivate {
	constructor(private userService: UserService) {}

	async canActivate(context: ExecutionContext) {
		let req = context.switchToHttp().getRequest();
		//检查用户名是否已存在
		let user = await this.userService.dbGetByKV('username', req.body.username, 'exists');
		//检查密码是否相符
		await this.userService.checkPassword(req.body.password, user);
		//
		req.user = user;
		//
		return true;
	}
}

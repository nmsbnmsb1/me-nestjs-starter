import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserModel } from '@modules/user/models/user';
import { UserService } from '@modules/user/services/user';

// @Injectable()
// export class PwdRegisterGuard implements CanActivate {
// 	constructor(private userService: UserService) {}

// 	async canActivate(context: ExecutionContext) {
// 		let req = context.switchToHttp().getRequest();
// 		//检查用户名是否已存在
// 		await this.userService.dbGetOne('username', req.body.username, 'id', 'not_exists');
// 		//
// 		return true;
// 	}
// }

// @Injectable()
// export class PwdLoginGuard implements CanActivate {
// 	constructor(private userService: UserService) { }

// 	async canActivate(context: ExecutionContext) {
// 		let req = context.switchToHttp().getRequest();
// 		//检查用户名是否已存在
// 		let user: UserModel = await this.userService.dbGetOne(
// 			'username',
// 			req.body.username,
// 			UserService.FieldSchemeAll,
// 			'exists',
// 			false
// 		);
// 		//检查密码是否相符
// 		await this.userService.checkPassword(req.body.password, user);
// 		//
// 		req.user = user;
// 		//
// 		return true;
// 	}
// }

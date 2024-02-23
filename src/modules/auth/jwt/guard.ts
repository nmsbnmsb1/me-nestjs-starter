import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { IData, TAG_COMMON, cexpire, cgetData } from 'me-cache-db';
import { ConfigService } from '@libs/config';
import { JwtEncryptService } from '@libs/encrypt';
import { UserCDB, UserModel } from '@modules/user/models/user';
import { JWTExceptions } from './execptions';

@Injectable()
export class JWTAuthGuard implements CanActivate {
	constructor(
		private readonly configService: ConfigService,
		private jwtEncryptService: JwtEncryptService,
		@InjectModel(UserModel, 'sys')
		private userRepo: typeof UserModel
	) {}

	async canActivate(context: ExecutionContext) {
		let req = context.switchToHttp().getRequest();
		let jwt = req.headers.token;
		//没有token
		if (!jwt) throw JWTExceptions.jwt_not_exists;
		//验证token
		let jwtData = this.jwtEncryptService.verify(jwt);
		if (!jwtData) throw JWTExceptions.invalid_jwt;
		//获取用户数据缓存
		let userData = await cgetData(undefined, { uuid: jwtData.uuid }, [
			{ ...UserCDB.ns.uuid(), fields: `$jwt,$expireAt,${UserCDB.tags[TAG_COMMON]}` },
		]);
		if (!userData) throw JWTExceptions.invalid_cache;
		if (userData.$jwt !== jwt) throw JWTExceptions.jwt_not_match;
		//延长缓存时间
		cexpire(undefined, { ...UserCDB.ns.uuid(), nn: jwtData.uuid }, this.configService.get(`user.cacheExpireMS`));
		//保存数据
		delete userData.$jwt;
		delete userData.$expireAt;
		req.userData = userData;
		req.user = this.userRepo.build(userData as any, { raw: true, isNewRecord: false });
		//
		return true;
	}
}

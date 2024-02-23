import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CryptoUtils } from 'me-utils';
import { cdel, csetData, sel } from 'me-cache-db';
import { ConfigService } from '@libs/config';
import { PwdEncryptService, JwtEncryptService } from '@libs/encrypt';
import { UserExceptions } from '../execptions';
import { UserModel, UserCDB } from '../models/user';

@Injectable()
export class UserService {
	constructor(
		private readonly configService: ConfigService,
		private readonly pwdService: PwdEncryptService,
		private readonly jwtEncryptService: JwtEncryptService,
		@InjectModel(UserModel, 'sys')
		private userRepo: typeof UserModel
	) {}

	//sel -------------------------------------------------------------------
	//-----------------------------------------------------------------------
	//根据主键获取用户对象
	public async dbGetByKV(key: 'id' | 'uuid' | 'username', value: any, checker: 'exists' | 'not_exists') {
		let user = await this.userRepo.findOne({ where: { [key]: value } });
		//checker
		if (checker === 'exists' && !user) throw UserExceptions.user_not_exists;
		else if (checker === 'not_exists' && user) throw UserExceptions.user_exists;
		//
		return user;
	}
	public async getByUUID(uuid: string) {
		return sel(
			undefined,
			{ uuid },
			[UserCDB.ns.uuid()],
			async () => this.userRepo.findOne({ where: { uuid }, raw: true }),
			(data) => this.userRepo.build(data as any, { raw: true, isNewRecord: false })
		);
	}
	//
	public async checkPassword(password: string, user: any) {
		let ret = await this.pwdService.verify(password, user.password);
		if (!ret) {
			throw UserExceptions.invalid_password;
		}
	}
	public async delUserCache(uuid: string) {
		return cdel(undefined, { ...UserCDB.ns.uuid(), nn: uuid });
	}
	//
	//注册/登陆
	public async register(userData: any) {
		//如果有密码，加密密码
		if (!userData.uuid) userData.uuid = CryptoUtils.uuid({ removeDash: true, lowerCase: true });
		if (userData.password) userData.password = await this.pwdService.create(userData.password);
		//
		return this.userRepo.create(userData);
	}
	public async login(user: UserModel) {
		//更新用户数据
		user.lastLoginAt = new Date();
		user.save();
		//创建用户缓存数据
		let jwt = this.jwtEncryptService.create({ uuid: user.uuid });
		let validMS = this.configService.get(`user.cacheExpireMS`);
		await csetData(
			undefined,
			{ $jwt: jwt, $expireAt: Date.now() + validMS, ...user.dataValues },
			[UserCDB.ns.uuid()],
			undefined,
			validMS
		);
		return { jwt, user };
	}
}

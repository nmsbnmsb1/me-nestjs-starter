import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as CacheDB from 'me-cache-db';
import { CryptoUtils } from 'me-utils';

import { ConfigService } from '@libs/config';
import { DBService } from '@libs/db/db.service';
import { JwtEncryptService, PwdEncryptService } from '@libs/encrypt';
import { UserExceptions } from '../execptions';
import { UserCDB, UserModel } from '../models/user';

@Injectable()
export class UserService {
	constructor(
		private readonly dbService: DBService,
		private readonly configService: ConfigService,
		private readonly pwdService: PwdEncryptService,
		private readonly jwtEncryptService: JwtEncryptService,
		@InjectModel(UserModel, 'sys')
		private userRepo: typeof UserModel
	) {}

	//const -------------------------------------------------------------------
	//-------------------------------------------------------------------
	public static FieldSchemeAll = `All`;
	public static FieldSchemeCommon = `Common`;

	//Select -------------------------------------------------------------------
	//-------------------------------------------------------------------
	public fieldScheme = new CacheDB.FieldScheme(this.dbService.getRepoAllFields(this.userRepo), {
		[UserService.FieldSchemeAll]: `id,uuid,username,password,lastLoginAt`,
		[UserService.FieldSchemeCommon]: `id,uuid,username,lastLoginAt`,
	});
	//根据主键获取用户对象
	public async dbGetOne(
		key: 'id' | 'uuid' | 'username',
		value: any,
		selFields: CacheDB.Fields,
		checker: 'exists' | 'not_exists',
		raw = true
	) {
		let user = await this.userRepo.findOne({
			attributes: this.fieldScheme.getFields(selFields),
			where: { [key]: value },
			raw,
		});
		//checker
		if (checker === 'exists' && !user) throw UserExceptions.user_not_exists;
		if (checker === 'not_exists' && user) throw UserExceptions.user_exists;
		//
		return user as any;
	}
	public async getByUUID(uuid: string, selFields: CacheDB.Fields, raw = true) {
		let fields = this.fieldScheme.getFields(selFields);
		let userData = { uuid };
		let user = await CacheDB.sel(
			undefined,
			userData,
			[{ ...UserCDB.ns.uuid(), fields }],
			async () => this.userRepo.findOne({ where: { uuid }, raw: true }),
			raw ? undefined : (data) => this.userRepo.build(data as any, { raw: true, isNewRecord: false })
		);
		return user;
	}
	//Composite -------------------------------------------------------------------
	//-------------------------------------------------------------------
	public async checkPassword(password: string, user: { password: string }) {
		let ret = await this.pwdService.verify(password, user.password);
		if (!ret) {
			throw UserExceptions.invalid_password;
		}
	}
	public async delUserCache(uuid: string) {
		return CacheDB.cdel(undefined, { ...UserCDB.ns.uuid(), nn: uuid });
	}
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
		await CacheDB.csetData(
			undefined,
			{ $jwt: jwt, $expireAt: Date.now() + validMS, ...user.dataValues },
			[UserCDB.ns.uuid()],
			undefined,
			validMS
		);
		//
		return { jwt, user };
	}
}

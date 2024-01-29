import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@libs/config';

@Injectable()
export class PwdEncryptService {
	constructor(private readonly configService: ConfigService) {}

	//创建
	async create(password: string) {
		return bcrypt.hash(password, this.configService.get('encrypt.pwd.saltRounds'));
	}

	//验证
	async verify(password: string, hashedPassword: string) {
		return bcrypt.compare(password, hashedPassword) as boolean;
	}
}

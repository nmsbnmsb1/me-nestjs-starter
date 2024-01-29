import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtEncryptService {
	constructor(private readonly nestJwtService: NestJwtService) {}

	//创建
	public create(payload: any): string {
		return this.nestJwtService.sign(payload);
	}

	//验证
	public verify(token: string): any {
		try {
			return this.nestJwtService.verify(token);
		} catch (error) {}
		return;
	}
}

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { UserController } from './controllers/user';
import { UserModel } from './models/user';
import { UserService } from './services/user';

//
@Module({
	imports: [
		SequelizeModule.forFeature([UserModel], 'sys'),
		//
	],
	controllers: [
		UserController,
		//
	],
	providers: [
		UserService,
		//
	],
	exports: [
		SequelizeModule,
		UserService,
		//
	],
})
export class UserModule {}

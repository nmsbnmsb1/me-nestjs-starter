import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from './models/user';
import { UserService } from './services/user';
import { UserController } from './controllers/user';

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

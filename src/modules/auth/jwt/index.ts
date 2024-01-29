import { Module, Global } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from '@modules/user/models/user';
import { JWTAuthGuard } from './guard';

@Global()
@Module({
	imports: [SequelizeModule.forFeature([UserModel], 'sys')],
	providers: [JWTAuthGuard],
	exports: [SequelizeModule, JWTAuthGuard],
})
export class JWTAuthModule {}

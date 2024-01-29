import { Module, Global } from '@nestjs/common';
import { UserModule } from '@modules/user';
import { PwdLoginGuard, PwdRegisterGuard } from './guards';
import { PwdAuthController } from './controllers';

@Global()
@Module({
	imports: [UserModule],
	controllers: [PwdAuthController],
	providers: [PwdLoginGuard, PwdRegisterGuard],
	exports: [PwdLoginGuard, PwdRegisterGuard],
})
export class PwdAuthModule {}

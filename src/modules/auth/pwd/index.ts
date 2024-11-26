import { Module, Global } from '@nestjs/common';
import { UserModule } from '@modules/user';
import { PwdAuthController } from './controllers';

@Global()
@Module({
	imports: [UserModule],
	controllers: [PwdAuthController],
	providers: [],
	exports: [],
})
export class PwdAuthModule { }

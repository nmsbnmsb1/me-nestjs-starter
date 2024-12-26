import { UserModule } from '@modules/user';
import { Global, Module } from '@nestjs/common';

import { PwdAuthController } from './controllers';

@Global()
@Module({
	imports: [UserModule],
	controllers: [PwdAuthController],
	providers: [],
	exports: [],
})
export class PwdAuthModule {}

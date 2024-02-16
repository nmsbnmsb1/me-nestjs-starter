import { DtoRules } from '@config/validators';
import { ValidateRules } from '@libs/validator';

//Register
export class RegisterDTO {
	@ValidateRules(DtoRules.username(true))
	username: string;
	@ValidateRules(DtoRules.password(true))
	password: string;
}

//login
export class LoginDTO {
	@ValidateRules(DtoRules.username(true))
	username: string;
	@ValidateRules(DtoRules.password(true))
	password: string;
}

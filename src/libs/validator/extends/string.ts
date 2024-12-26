import * as ClassValidator from 'class-validator';

//------------------------------------------------------------------------------------------
//alphaDash
//值只能是 [a-zA-Z_] 组成
export function isAlphaDash(value: any) {
	return ClassValidator.matches(value, /^[a-zA-Z_]+$/);
}
export function IsAlphaDash(validationOptions?: ClassValidator.ValidationOptions) {
	return ClassValidator.Matches(/^[a-zA-Z_]+$/, validationOptions);
}

//alphaNumericDash
//值只能是 [a-zA-Z0-9_] 组成
export function isAlphaNumericDash(value: any) {
	return ClassValidator.matches(value, /^[a-zA-Z0-9_]+$/);
}
export function IsAlphaNumericDash(validationOptions?: ClassValidator.ValidationOptions) {
	return ClassValidator.Matches(/^[a-zA-Z0-9_]+$/, validationOptions);
}

//md5
export function isMd5(value: any) {
	return ClassValidator.isHash(value, 'md5');
}
export function IsMd5(validationOptions?: ClassValidator.ValidationOptions) {
	if (!validationOptions) validationOptions = {};
	if (!validationOptions.message) validationOptions.message = '#isMd5';
	return ClassValidator.IsHash('md5', validationOptions);
}

export function isSha256(value: any) {
	return ClassValidator.isHash(value, 'sha256');
}
export function IsSha256(validationOptions?: ClassValidator.ValidationOptions) {
	if (!validationOptions) validationOptions = {};
	if (!validationOptions.message) validationOptions.message = '#isSha256';
	return ClassValidator.IsHash('sha256', validationOptions);
}

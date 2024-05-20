import * as ClassValidator from 'class-validator';

//required
//必填
export const required = ClassValidator.isNotEmpty;
export const Required = ClassValidator.IsNotEmpty;

//requiredIf
//当另一个项的值为某些值其中一项时，该项必填
export const REQUIRED_IF = 'requiredIf';
export function requiredIf(value: any, object: any, otherPropertyName: string, values: any[]) {
	if (ClassValidator.isNotEmpty(value)) return true;
	//当值为空时
	let otherValue = object[otherPropertyName];
	let index = values.indexOf(otherValue);
	return index >= 0 ? true : false;
}
export function RequiredIf(
	otherPropertyName: string,
	values: any[],
	validationOptions?: ClassValidator.ValidationOptions
) {
	return ClassValidator.ValidateIf(
		(object: any, value: any) => requiredIf(value, object, otherPropertyName, values),
		validationOptions
	);
}

//requiredIfNot
//当另一个项的值不在某些值中时，该项必填
export const REQUIRED_IF_NOT = 'requiredIfNot';
export function requiredIfNot(value: any, object: any, otherPropertyName: string, values: any[]) {
	if (ClassValidator.isNotEmpty(value)) return true;
	//当值为空时
	let otherValue = object[otherPropertyName];
	let index = values.indexOf(otherValue);
	return index < 0 ? true : false;
}
export function RequiredIfNot(
	otherPropertyName: string,
	values: any[],
	validationOptions?: ClassValidator.ValidationOptions
) {
	return ClassValidator.ValidateIf(
		(object: any, value: any) => requiredIfNot(value, object, otherPropertyName, values),
		validationOptions
	);
}

//requiredWith
//当其他几项有一项值存在时，该项必填。
export const REQUIRED_WITH = 'requiredWith';
export function requiredWith(value: any, object: any, otherPropertyNames: string[]) {
	if (ClassValidator.isNotEmpty(value)) return true;
	//当值为空时
	for (let n of otherPropertyNames) {
		if (ClassValidator.isNotEmpty(object[n])) {
			return true;
		}
	}
	return false;
}
export function RequiredWith(otherPropertyNames: string[], validationOptions?: ClassValidator.ValidationOptions) {
	return ClassValidator.ValidateIf(
		(object: any, value: any) => requiredWith(value, object, otherPropertyNames),
		validationOptions
	);
}

//requiredWithAll
//当其他几项值都存在时，该项必填。
export const REQUIRED_WITH_ALL = 'requiredWithAll';
export function requiredWithAll(value: any, object: any, otherPropertyNames: string[]) {
	if (ClassValidator.isNotEmpty(value)) return true;
	//当值为空时
	for (let n of otherPropertyNames) {
		if (ClassValidator.isEmpty(object[n])) {
			return false;
		}
	}
	return true;
}
export function RequiredWithAll(otherPropertyNames: string[], validationOptions?: ClassValidator.ValidationOptions) {
	return ClassValidator.ValidateIf(
		(object: any, value: any) => requiredWithAll(value, object, otherPropertyNames),
		validationOptions
	);
}

//requiredWithOut
//当其他几项有一项值不存在时，该项必填
export const REQUIRED_WITHOUT = 'requiredWithOut';
export function requiredWithOut(value: any, object: any, otherPropertyNames: string[]) {
	if (ClassValidator.isNotEmpty(value)) return true;
	//当值为空时
	for (let n of otherPropertyNames) {
		if (ClassValidator.isEmpty(object[n])) {
			return true;
		}
	}
	return false;
}
export function RequiredWithOut(otherPropertyNames: string[], validationOptions?: ClassValidator.ValidationOptions) {
	return ClassValidator.ValidateIf(
		(object: any, value: any) => requiredWithOut(value, object, otherPropertyNames),
		validationOptions
	);
}

//requiredWithOutAll
//当其他几项值都不存在时，该项必填
export const REQUIRED_WITHOUT_ALL = 'requiredWithOutAll';
export function requiredWithOutAll(value: any, object: any, otherPropertyNames: string[]) {
	if (ClassValidator.isNotEmpty(value)) return true;
	//当值为空时
	for (let n of otherPropertyNames) {
		if (ClassValidator.isNotEmpty(object[n])) {
			return false;
		}
	}
	return true;
}
export function RequiredWithOutAll(otherPropertyNames: string[], validationOptions?: ClassValidator.ValidationOptions) {
	return ClassValidator.ValidateIf(
		(object: any, value: any) => requiredWithOutAll(value, object, otherPropertyNames),
		validationOptions
	);
}

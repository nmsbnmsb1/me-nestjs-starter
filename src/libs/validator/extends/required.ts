import * as ClassValidator from 'class-validator';

//required
//必填
export const required = ClassValidator.isNotEmpty;
export const Required = ClassValidator.IsNotEmpty;

//requiredIf
//当另一个项的值为某些值其中一项时，该项必填
export const REQUIRED_IF = 'requiredIf';
export function requiredIf(value: any, object: any, otherPropertyName: string, values: any[]) {
	let otherValue = object[otherPropertyName];
	let index = values.indexOf(otherValue);
	return index >= 0 ? ClassValidator.isNotEmpty(value) : true;
}
export function RequiredIf(
	otherPropertyName: string,
	values: any[],
	validationOptions?: ClassValidator.ValidationOptions
) {
	return ClassValidator.ValidateBy(
		{
			name: REQUIRED_IF,
			constraints: [otherPropertyName, values],
			validator: {
				validate: (value, args) => requiredIf(value, args?.object, args?.constraints[0], args?.constraints[1]),
				defaultMessage: ClassValidator.buildMessage(
					(eachPrefix, args) =>
						`${eachPrefix} $property is required when ${args?.constraints[0]} in ${args?.constraints[1]}`,
					validationOptions
				),
			},
		},
		validationOptions
	);
}

//requiredIfNot
//当另一个项的值不在某些值中时，该项必填
export const REQUIRED_IF_NOT = 'requiredIfNot';
export function requiredIfNot(value: any, object: any, otherPropertyName: string, values: any[]) {
	let otherValue = object[otherPropertyName];
	let index = values.indexOf(otherValue);
	return index < 0 ? ClassValidator.isNotEmpty(value) : true;
}
export function RequiredIfNot(
	otherPropertyName: string,
	values: any[],
	validationOptions?: ClassValidator.ValidationOptions
) {
	return ClassValidator.ValidateBy(
		{
			name: REQUIRED_IF_NOT,
			constraints: [otherPropertyName, values],
			validator: {
				validate: (value, args) => requiredIfNot(value, args?.object, args?.constraints[0], args?.constraints[1]),
				defaultMessage: ClassValidator.buildMessage(
					(eachPrefix, args) =>
						`${eachPrefix} $property is required when ${args?.constraints[0]} not in ${args?.constraints[1]}`,
					validationOptions
				),
			},
		},
		validationOptions
	);
}

//requiredWith
//当其他几项有一项值存在时，该项必填。
export const REQUIRED_WITH = 'requiredWith';
export function requiredWith(value: any, object: any, otherPropertyNames: string[]) {
	for (let n of otherPropertyNames) {
		if (ClassValidator.isNotEmpty(object[n])) {
			return ClassValidator.isNotEmpty(value);
		}
	}
	return true;
}
export function RequiredWith(otherPropertyNames: string[], validationOptions?: ClassValidator.ValidationOptions) {
	return ClassValidator.ValidateBy(
		{
			name: REQUIRED_WITH,
			constraints: [otherPropertyNames],
			validator: {
				validate: (value, args) => requiredWith(value, args?.object, args?.constraints[0]),
				defaultMessage: ClassValidator.buildMessage(
					(eachPrefix, args) =>
						`${eachPrefix} $property is required when one of property[${args?.constraints[0]}] is not empty`,
					validationOptions
				),
			},
		},
		validationOptions
	);
}

//requiredWithAll
//当其他几项值都存在时，该项必填。
export const REQUIRED_WITH_ALL = 'requiredWithAll';
export function requiredWithAll(value: any, object: any, otherPropertyNames: string[]) {
	for (let n of otherPropertyNames) {
		//有一项不存在时，该项不必填
		if (ClassValidator.isEmpty(object[n])) {
			return true;
		}
	}
	return ClassValidator.isNotEmpty(value);
}
export function RequiredWithAll(otherPropertyNames: string[], validationOptions?: ClassValidator.ValidationOptions) {
	return ClassValidator.ValidateBy(
		{
			name: REQUIRED_WITH_ALL,
			constraints: [otherPropertyNames],
			validator: {
				validate: (value, args) => requiredWithAll(value, args?.object, args?.constraints[0]),
				defaultMessage: ClassValidator.buildMessage(
					(eachPrefix, args) =>
						`${eachPrefix} $property is required when all of property[${args?.constraints[0]}] is not empty`,
					validationOptions
				),
			},
		},
		validationOptions
	);
}

//requiredWithOut
//当其他几项有一项值不存在时，该项必填
export const REQUIRED_WITHOUT = 'requiredWithOut';
export function requiredWithOut(value: any, object: any, otherPropertyNames: string[]) {
	for (let n of otherPropertyNames) {
		if (ClassValidator.isEmpty(object[n])) {
			return ClassValidator.isNotEmpty(value);
		}
	}
	return true;
}
export function RequiredWithOut(otherPropertyNames: string[], validationOptions?: ClassValidator.ValidationOptions) {
	return ClassValidator.ValidateBy(
		{
			name: REQUIRED_WITHOUT,
			constraints: [otherPropertyNames],
			validator: {
				validate: (value, args) => requiredWithOut(value, args?.object, args?.constraints[0]),
				defaultMessage: ClassValidator.buildMessage(
					(eachPrefix, args) =>
						`${eachPrefix} $property is required when one of property[${args?.constraints[0]}] is empty`,
					validationOptions
				),
			},
		},
		validationOptions
	);
}

//requiredWithOutAll
//当其他几项值都不存在时，该项必填
export const REQUIRED_WITHOUT_ALL = 'requiredWithOutAll';
export function requiredWithOutAll(value: any, object: any, otherPropertyNames: string[]) {
	for (let n of otherPropertyNames) {
		//有一项存在时，该项不必填
		if (ClassValidator.isNotEmpty(object[n])) {
			return true;
		}
	}
	return ClassValidator.isNotEmpty(value);
}
export function RequiredWithOutAll(otherPropertyNames: string[], validationOptions?: ClassValidator.ValidationOptions) {
	return ClassValidator.ValidateBy(
		{
			name: REQUIRED_WITHOUT_ALL,
			constraints: [otherPropertyNames],
			validator: {
				validate: (value, args) => requiredWithOutAll(value, args?.object, args?.constraints[0]),
				defaultMessage: ClassValidator.buildMessage(
					(eachPrefix, args) =>
						`${eachPrefix} $property is required when all of property[${args?.constraints[0]}] is empty`,
					validationOptions
				),
			},
		},
		validationOptions
	);
}

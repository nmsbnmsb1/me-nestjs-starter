import * as ClassValidator from 'class-validator';

//requiredWithOut
//当其他几项有一项值不存在时，该项必填
export const ARRAY_INDEXOF = 'arrayIndexOf';
export function arrayIndexOf(values, array) {
	if (!Array.isArray(values)) return false;
	//
	for (let v of values) {
		if (array.indexOf(v) < 0) {
			return false;
		}
	}
	return true;
}
export function ArrayIndexOf(arr: any[], validationOptions?: ClassValidator.ValidationOptions) {
	return ClassValidator.ValidateBy(
		{
			name: ARRAY_INDEXOF,
			constraints: [arr],
			validator: {
				validate: (value, args) => arrayIndexOf(value, args?.constraints[0]),
				defaultMessage: ClassValidator.buildMessage(
					(eachPrefix, args) => `${eachPrefix}$property must contain $constraint1 values`,
					validationOptions
				),
			},
		},
		validationOptions
	);
}

import { Transform, TransformOptions } from 'class-transformer';
import { getValidationExecption } from './utils';

export * from 'class-transformer';

//转换数字
export function TransformToNumber(options: TransformOptions = {}): PropertyDecorator {
	return Transform((v) => {
		try {
			return JSON.parse(`{"value":${v.value}}`).value
		} catch (e) {
			throw getValidationExecption(v.key, 'isNumberString')
		}
	}, options);
}

//转换数字数组
export function TransformToNumberArray(options: TransformOptions = {}): PropertyDecorator {
	return Transform((v) => {
		try {
			return JSON.parse(`[${v.value}]`)
		} catch (e) {
			throw getValidationExecption(v.key, 'isNumberArray')
		}
	}, options);
}

//转换字符串数组
export function TransformToStringArray(options: TransformOptions = {}): PropertyDecorator {
	return Transform((v) => {
		try {
			return JSON.parse(`["${v.value.split(',').join(`","`)}"]`)
		} catch (e) {
			throw getValidationExecption(v.key, 'isStringArray')
		}
	}, options);
}

//转换成布尔数字
export function TransformToBooleanNumber(options: TransformOptions = {}): PropertyDecorator {
	return Transform((v) => {
		if (v.value === 'true') return 1;
		if (v.value === 'false') return 0;
		if (v.value > 0) return 1;
		if (v.value === 0) return 0;
		if (v.value < 0) return undefined;
		if (v.value === null || v.value === undefined) return undefined;
		return v.value ? 1 : 0;
	}, options);
}

//转换json对象
export function TransformToJSONObject(options: TransformOptions = {}): PropertyDecorator {
	return Transform((v) => {
		let value = v.value
		if (typeof value === 'object') return value;
		//
		try {
			if (!value.startsWith('{')) value = `{${value}}`;
			return JSON.parse(value);
		} catch (e) {
			throw getValidationExecption(v.key, 'isJSONString')
		}
	}, options);
}
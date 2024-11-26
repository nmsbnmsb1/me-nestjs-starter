import { HttpStatus } from '@nestjs/common';
import { Transform, TransformOptions } from 'class-transformer';

export * from 'class-transformer';

//转换成字符串数组
export function TransformToNumber(options: TransformOptions = {}): PropertyDecorator {
	return Transform((v) => JSON.parse(`{"value":${v.value}}`).value, options);
}

export function TransformToNumberArray(options: TransformOptions = {}): PropertyDecorator {
	return Transform((v) => JSON.parse(`{"value":[${v.value}]}`).value, options);
}

export function TransformToStringArray(options: TransformOptions = {}): PropertyDecorator {
	return Transform((v) => JSON.parse(`{"value":["${v.value.split(',').join(`","`)}"]}`).value, options);
}

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

export function TransformToJSONObject(options: TransformOptions = {}): PropertyDecorator {
	return Transform((v) => {
		let value = v.value
		try {
			if (typeof value === 'string') {
				if (!value.startsWith('{')) value = `{${value}}`;
				return JSON.parse(value);
			} else {
				throw { id: 'invalid_param', description: `${v.key}.invalid_json_string`, http_status: HttpStatus.BAD_REQUEST }
			}

		} catch (error) {
			throw { id: 'invalid_param', description: `${v.key}.invalid_json_string`, http_status: HttpStatus.BAD_REQUEST }
		}
	}, options);
}
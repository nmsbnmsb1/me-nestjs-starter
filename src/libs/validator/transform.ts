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

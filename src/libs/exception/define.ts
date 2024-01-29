import { HttpException, HttpStatus } from '@nestjs/common';

//错误配置对象
/**
 *  @example
 *		const UserExceptions = registerAs({
 *			user_exists: 'User is not exists',
 *			user_exists: { description:'User is not exists', http_status:200 },
 *		})
 */
export type Exception = { id: string; description: string; http_status?: number };
//
export interface ExceptionMap {
	[id: string]: string | { description: string | { dev: string; pro: string }; http_status?: number };
}
export function registerByMap<ExceptionMap>(exceptions: ExceptionMap): {
	[P in keyof ExceptionMap]: Exception;
} {
	let newm: any = {};
	for (let id in exceptions) {
		let v: any = exceptions[id];
		if (typeof v === 'string') {
			newm[id] = { ___r: true, id, description: v, http_status: HttpStatus.INTERNAL_SERVER_ERROR };
		} else {
			newm[id] = { ___r: true, id, http_status: HttpStatus.INTERNAL_SERVER_ERROR, ...v };
			if (typeof newm[id].description !== 'string') {
				newm[id].description = newm[id].description[process.env.NODE_ENV !== 'production' ? 'dev' : 'pro'];
			}
		}
	}
	return newm;
}
//错误
export class AppException extends HttpException {
	constructor(execption: Exception, options?: any) {
		super({ id: execption.id, description: execption.description }, execption.http_status || HttpStatus.INTERNAL_SERVER_ERROR, options);
	}
}

//定义2
//export type ExceptionList = (string | Exception)[];
export function registerByList<T extends readonly any[]>(
	es: T
): {
	[key in T[number]]: Exception;
} {
	let newm: any = {};
	for (let v of es) {
		if (typeof v === 'string') {
			newm[v] = { ___r: true, id: v, description: v, http_status: HttpStatus.INTERNAL_SERVER_ERROR };
		} else {
			newm[v.id] = { ___r: true, http_status: HttpStatus.INTERNAL_SERVER_ERROR, ...v };
			if (typeof newm[v.id].description !== 'string') {
				newm[v.id].description = newm[v.id].description[process.env.NODE_ENV !== 'production' ? 'dev' : 'pro'];
			}
		}
	}
	return newm;
}

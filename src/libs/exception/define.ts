import { HttpException, HttpStatus } from '@nestjs/common';

let isDevelopment = process.env.NODE_ENV !== 'production';

//错误配置对象
export type Description = { dev: string; pro_key?: string; pro?: string };
export interface ExceptionMap {
	[id: string]: string | ({ http_status?: number } & Description);
}
export type Exception = { id: string; http_status?: number; description?: string } & Partial<Description>;
export function registerByMap<ExceptionMap>(exceptions: ExceptionMap): {
	[P in keyof ExceptionMap]: Exception;
} {
	let newm: any = {};
	for (let id in exceptions) {
		let v: any = exceptions[id];
		typeof v === 'string'
			? (newm[id] = { __r: true, __m: newm, id, http_status: HttpStatus.INTERNAL_SERVER_ERROR, description: v })
			: (newm[id] = { __r: true, __m: newm, id, http_status: HttpStatus.INTERNAL_SERVER_ERROR, ...v });
	}
	return newm;
}
export function getExceptionMessage(execption: Exception) {
	if ((execption as any).__r && !execption.description) {
		if (isDevelopment) {
			return { id: execption.id, description: execption.dev };
		} else if (execption.pro) {
			return { id: execption.id, description: execption.pro };
		} else if (execption.pro_key) {
			return getExceptionMessage((execption as any).__m[execption.pro_key]);
		}
	}
	return { id: execption.id, description: execption.description };
}

//异常
export class AppException extends HttpException {
	constructor(execption: Exception, options?: any) {
		super(getExceptionMessage(execption), execption.http_status || HttpStatus.INTERNAL_SERVER_ERROR, options);
	}
}

//定义2
//export type ExceptionList = (string | Exception)[];
// export function registerByList<T extends readonly any[]>(
// 	es: T
// ): {
// 	[key in T[number]]: Exception;
// } {
// 	let newm: any = {};
// 	for (let v of es) {
// 		typeof v === 'string'
// 			? (newm[v] = { __r: true, __m: newm, id: v, http_status: HttpStatus.INTERNAL_SERVER_ERROR, description: v })
// 			: (newm[v.id] = { __r: true, __m: newm, http_status: HttpStatus.INTERNAL_SERVER_ERROR, ...v });
// 	}
// 	return newm;
// }

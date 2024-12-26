import { HttpException, HttpStatus } from '@nestjs/common';

//错误配置对象
export interface Exception {
	__reg: boolean;
	__m: { [id: string]: Exception };
	id: string;
	description?: any;
	pro_id?: string;
	http_status?: number;
}
export type ExceptionMap = { [id: string]: Omit<Exception, '__reg' | '__m' | 'id'> };
export function registerByMap<ExceptionMap>(m: ExceptionMap): { [P in keyof ExceptionMap]: Exception } {
	let nm: any = {};
	for (let id in m) {
		let ne = { __reg: true, __m: nm, id, http_status: HttpStatus.INTERNAL_SERVER_ERROR };
		//
		let e = m[id] as any;
		for (let k in e) ne[k] = e[k];
		//
		nm[id] = ne;
	}
	return nm;
}

//创建异常
export function createAppException(
	e: Omit<Exception, '__reg' | '__m'>,
	http_status: number = HttpStatus.INTERNAL_SERVER_ERROR,
	options?: any
) {
	return new HttpException(e, http_status, options);
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

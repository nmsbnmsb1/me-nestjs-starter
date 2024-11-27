import { Request, Response } from 'express';
import { HttpException, ExceptionFilter, Catch, ArgumentsHost, Logger, HttpStatus } from '@nestjs/common';
import { AppClsStore } from '@libs/cls';
import { isDevelopment } from '@libs/utils';

import { ClsService } from 'nestjs-cls';
import { Exception } from './define';

const internal_server_error = 'INTERNAL_SERVER_ERROR'.toLowerCase()

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
	private logger = new Logger('AppExceptionFilter');

	constructor(
		private readonly clsService: ClsService<AppClsStore> // 通过构造函数注入
	) { }

	catch(
		e: Exception | Omit<Exception, '__reg' | '__m'> | HttpException | Error,
		host: ArgumentsHost
	) {
		let ctx = host.switchToHttp();
		let request = ctx.getRequest<Request>();
		let response = ctx.getResponse<Response>();
		//
		let traceId = this.clsService.get('traceId');
		let path = request.url;
		let http_status: number;
		let id: string;
		let description: any;
		//
		//console.log('msg', exception);
		if ((e as Exception).__reg) {
			let ee = e as Exception
			http_status = ee.http_status || HttpStatus.INTERNAL_SERVER_ERROR;
			if (isDevelopment || !ee.pro_id) {
				id = ee.id
				description = ee.description
				this.logger.error(`${path}: ${http_status} - ${id} ${description || ''}`);
			} else {
				id = ee.pro_id
				if (ee.__m[ee.pro_id]) description = ee.__m[ee.pro_id].description
				else description = ee.description
				this.logger.error(`${path}: ${http_status} - ${ee.pro_id}(${ee.id}) ${description || ''}`);
			}
		} else if (e instanceof HttpException) {
			http_status = e.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;
			//
			let resp: any = e.getResponse();
			if (typeof resp === 'string') {
				id = description = resp;
				this.logger.error(`${path}: ${http_status} - ${id} ${description || ''}`);
			} else if (resp.__reg || resp.id) {
				let ee = resp as Exception;
				if (isDevelopment || !ee.pro_id) {
					id = ee.id
					description = ee.description
					this.logger.error(`${path}: ${http_status} - ${id} ${description || ''}`);
				} else {
					id = ee.pro_id
					if (ee.__m?.[ee.pro_id]) description = ee.__m[ee.pro_id].description
					else description = ee.description
					this.logger.error(`${path}: ${http_status} - ${ee.pro_id}(${ee.id}) ${description || ''}`);
				}
			} else {
				id = isDevelopment && resp.error ? resp.error.replace(/\s/g, '_') : internal_server_error;
				description = isDevelopment && resp.message ? resp.message : internal_server_error;
				this.logger.error(`${path}: ${http_status} - ${id} ${description || ''}`);
			}
		} else if (e instanceof Error) {
			http_status = HttpStatus.INTERNAL_SERVER_ERROR;
			id = internal_server_error;
			if (isDevelopment) description = e.message
			this.logger.error(`${path}: ${http_status} - ${id} ${e.message}\n${e.stack}}`);
		} else {
			let ee = e as any
			http_status = ee.http_status || HttpStatus.INTERNAL_SERVER_ERROR;
			id = ee.id || internal_server_error;
			description = ee.description
			this.logger.error(`${path}: ${http_status} - ${id} ${ee.description || ''}}`);
		}
		//
		response.status(http_status);
		response.header('Content-Type', 'application/json; charset=utf-8');
		response.send({ traceId, path, http_status, id, description });
	}
}

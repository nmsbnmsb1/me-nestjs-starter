import { Request, Response } from 'express';
import { HttpException, ExceptionFilter, Catch, ArgumentsHost, Logger, HttpStatus } from '@nestjs/common';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
	private logger = new Logger('AppExceptionFilter');

	catch(exception: any, host: ArgumentsHost) {
		let ctx = host.switchToHttp();
		let request = ctx.getRequest<Request>();
		let response = ctx.getResponse<Response>();
		//
		let path = request.url;
		let id;
		let status;
		let description;
		//
		//console.log('msg', exception);
		//
		if (exception.___r) {
			id = exception.id;
			description = exception.description || exception.id;
			status = exception.http_status || HttpStatus.INTERNAL_SERVER_ERROR;
			this.logger.error(`${path}: ${status} - ${description}`);
		} else if (exception instanceof HttpException) {
			status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;
			//
			let resp: any = exception.getResponse();
			if (typeof resp === 'string') {
				id = description = resp;
			} else if (resp.id || resp.description) {
				id = resp.id || resp.description;
				description = resp.description || resp.id;
			} else {
				id = resp.error ? resp.error.replace(/\s/g, '_') : 'INTERNAL_SERVER_ERROR';
				description = resp.message || 'INTERNAL_SERVER_ERROR';
			}
			this.logger.error(`${path}: ${status} - ${description}`);
		} else {
			id = HttpStatus.INTERNAL_SERVER_ERROR;
			description = exception.message;
			status = HttpStatus.INTERNAL_SERVER_ERROR;
			this.logger.error(`${path}: ${exception.stack}}`);
		}
		//
		response.status(status);
		response.header('Content-Type', 'application/json; charset=utf-8');
		response.send({ ts: Date.now(), path, status, id, description /*traceID: clsNamespace.get('traceID')*/ });
	}
}

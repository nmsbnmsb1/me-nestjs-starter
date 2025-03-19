import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';

export const NestLikeFormat = (appName: string) => [
	winston.format.timestamp(),
	winston.format.ms(),
	nestWinstonModuleUtilities.format.nestLike(appName, {
		colors: true,
		prettyPrint: true,
		processId: true,
		appName: true,
	}),
	winston.format.printf((info: any) => {
		let message = info[Symbol.for('message')];
		let dateMatch = message.match(/\d{1,2}\/\d{1,2}\/\d{4},\s+\d{1,2}:\d{2}:\d{2}\s+[AP]M/);
		if (dateMatch) {
			let dateIndex = dateMatch.index;
			message = `${message.slice(0, dateIndex)} - ${message.slice(dateIndex)}`;
			//
			let dateStr = dateMatch[0];
			let [datePart, timePart] = dateStr.split(',');
			let [month, day, year] = datePart.split('/');
			month = month.padStart(2, '0');
			day = day.padStart(2, '0');
			let newDateStr = `${month}/${day}/${year},${timePart}`;
			message = message.replace(dateStr, newDateStr);
		}
		//其他的修正
		if (info.level === 'error') {
			//message = message.replace('{ stack: [ \x1B[1mnull\x1B[22m ] } ', '');
		}
		return message;
	}),
];

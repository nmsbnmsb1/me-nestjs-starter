import * as ClassValidator from 'class-validator';

//
// export function before(value: any, maxDate: Date | (() => Date)) {
// 	return ClassValidator.maxDate(value, maxDate);
// }
// export function Before(maxDate: Date | (() => Date), validationOptions?: ClassValidator.ValidationOptions) {
// 	return ClassValidator.MaxDate(maxDate, validationOptions);
// }
export const before = ClassValidator.maxDate;
export const Before = ClassValidator.MaxDate;

//
// export function after(value: any, minDate: Date | (() => Date)) {
// 	return ClassValidator.minDate(value, minDate);
// }
// export function After(minDate: Date | (() => Date), validationOptions?: ClassValidator.ValidationOptions) {
// 	return ClassValidator.MinDate(minDate, validationOptions);
// }
export const after = ClassValidator.minDate;
export const After = ClassValidator.MinDate;

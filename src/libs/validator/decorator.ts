import * as Transform from './transform';
import * as ClassValidator from './extends';

//规则定义
export type RuleArgs = any[];
//规则详细定义
export type RuleOptions = {
	args: RuleArgs;
	options?: Transform.TransformOptions | ClassValidator.ValidationOptions;
	// validate?: (value: any, args?: ClassValidator.ValidationArguments) => boolean;
	// message?: string | ((eachPrefix: string, args?: ClassValidator.ValidationArguments) => string);
	// defaultMessage?: string | ((args?: ClassValidator.ValidationArguments) => string);
};
//规则集
export type Rules = { name: string; [name: string]: any | RuleArgs | RuleOptions };
export function ValidateRules(
	rules: Rules,
	transformOptions?: Transform.TransformOptions,
	validateOptions?: ClassValidator.ValidationOptions
) {
	return (object: object, propertyName: string) => {
		//遍历validators
		for (const name in rules) {
			if (name === 'name') continue;
			//
			let isTransform;
			let decorator;
			if (name.startsWith('Transform')) {
				isTransform = true;
				decorator = (Transform as any)[name];
			} else {
				decorator = (ClassValidator as any)[name];
			}
			//解析rule
			let ruleObject = rules[name];
			let args: any[];
			let opts: any = isTransform ? transformOptions : validateOptions;
			if (!ruleObject.args) {
				args = ruleObject;
				if (!Array.isArray(args)) args = [args];
			} else {
				args = ruleObject.args;
				opts = ruleObject.options || opts;
			}
			//手动运行装饰器
			//如果 constraints 只有一个元素，且该元素是true，则不传递参数
			if (isTransform) {
				decorator(opts)(object, propertyName);
			} else {
				if (args.length === 1 && args[0] === true) {
					decorator(opts)(object, propertyName);
				} else {
					decorator(...args, opts)(object, propertyName);
				}
			}
			// ClassValidator.registerDecorator({
			// 	name: `${rules.name}.${rname}`,
			// 	target: object.constructor,
			// 	propertyName: propertyName,
			// 	options: validationOptions,
			// 	constraints,
			// 	validator: {
			// 		validate: rule.validate,
			// 		defaultMessage: rule.defaultMessage || ClassValidator.buildMessage(rule.message, validationOptions),
			// 	},
			// });
		}
	};
}

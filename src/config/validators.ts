function requiredWrap(v: any) {
	return (required: any = false) => {
		if (typeof required === 'boolean') {
			v[required ? 'Required' : 'IsOptional'] = true;
		} else {
			for (let k in required) {
				v[k] = required[k];
			}
		}
		return v;
	};
}

export const DtoRules = {
	//base
	string: requiredWrap({ name: 'string' }),
	strings: requiredWrap({ name: 'strings', TransformToStringArray: true, IsArray: true }),
	int: requiredWrap({ name: 'int', IsInt: true }),
	ints: requiredWrap({
		name: 'ints',
		TransformToIntArray: true,
		IsArray: true,
		IsInt: { args: [true], options: { each: true } },
	}),
	number: requiredWrap({ name: 'number', TransformToNumber: true, IsNumber: true }),
	numbers: requiredWrap({
		name: 'numbers',
		TransformToNumberArray: true,
		IsArray: true,
		IsNumber: { args: [true], options: { each: true } },
	}),
	//
	id: requiredWrap({ name: 'id', IsInt: true }),
	ids: requiredWrap({
		name: 'ids',
		TransformToIntArray: true,
		IsArray: true,
		IsInt: { args: [true], options: { each: true } },
	}),
	page: requiredWrap({ name: 'page', IsInt: true, IsPositive: true }),
	page_size: requiredWrap({ name: 'page_size', IsInt: true, Min: 0 }),
	//用户名
	username: requiredWrap({ name: 'password', Length: [2, 32], IsAlphaNumericDash: true }),
	password: requiredWrap({ name: 'username', Length: [2, 32] /*IsMd5: false*/ }),
};

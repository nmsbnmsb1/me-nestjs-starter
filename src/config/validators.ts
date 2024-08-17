function requiredWrap(v: any) {
	return (required: any = false) => {
		let nv = {};
		if (typeof required === 'boolean') {
			nv[required ? 'Required' : 'IsOptional'] = true;
		} else {
			for (let k in required) {
				nv[k] = required[k];
			}
		}
		return { ...nv, ...v };
	};
}

export const DtoRules = {
	//base
	string: requiredWrap({}),
	strings: requiredWrap({ TransformToStringArray: true, IsArray: true }),
	int: requiredWrap({ TransformToStringArray: true, IsInt: true }),
	ints: requiredWrap({
		TransformToIntArray: true,
		IsArray: true,
		IsInt: { args: [true], options: { each: true } },
	}),
	number: requiredWrap({ TransformToNumber: true, IsNumber: true }),
	numbers: requiredWrap({
		TransformToNumberArray: true,
		IsArray: true,
		IsNumber: { args: [true], options: { each: true } },
	}),
	//
	id: requiredWrap({ IsInt: true }),
	ids: requiredWrap({
		TransformToIntArray: true,
		IsArray: true,
		IsInt: { args: [true], options: { each: true } },
	}),
	page: requiredWrap({ IsInt: true, IsPositive: true }),
	page_size: requiredWrap({ IsInt: true, Min: 0 }),
	//用户名
	username: requiredWrap({ Length: [2, 32], IsAlphaNumericDash: true }),
	password: requiredWrap({ Length: [2, 32] /*IsMd5: false*/ }),
};

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
	int: requiredWrap({ TransformToNumber: true, IsInt: true }),
	ints: requiredWrap({
		TransformToNumberArray: true,
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
	id: requiredWrap({ TransformToNumber: true, IsInt: true }),
	ids: requiredWrap({
		TransformToNumberArray: true,
		IsArray: true,
		IsInt: { args: [true], options: { each: true } },
	}),
	page: requiredWrap({ TransformToNumber: true, IsInt: true, IsPositive: true }),
	page_size: requiredWrap({ TransformToNumber: true, IsInt: true, Min: 0 }),
	//用户名
	username: requiredWrap({ Length: [2, 32], IsAlphaNumericDash: true }),
	password: requiredWrap({ Length: [2, 32] /*IsMd5: false*/ }),
};

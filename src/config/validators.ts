function requiredWrap(v: any) {
	return (required: any = false) => {
		let nv = { ...v };
		if (typeof required === 'boolean') {
			nv[required ? 'Required' : 'IsOptional'] = true;
		} else {
			for (let k in required) {
				nv[k] = required[k];
			}
		}
		return nv;
	};
}

export const DtoRules = {
	//base
	string: requiredWrap({}),
	strings: requiredWrap({ TransformToStringArray: true, IsArray: true }),
	int: requiredWrap({ IsInt: true }),
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

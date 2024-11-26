const Pre = {
	Length_2_3: () => ({ args: [2, 32], options: { message: '#length_2_32' } }),
	Min_0: () => ({ args: [0], options: { message: '#min_0' } })
}

function requiredWrap(v: any) {
	return (required: any = false) => {
		let nv = {};
		//处理Require相关的属性
		if (typeof required === 'boolean') {
			nv[required ? 'Required' : 'IsOptional'] = true;
		} else {
			for (let k in required) nv[k] = required[k];
		}
		return { ...nv, ...v };
	};
}

export const DtoRules = {
	//base
	string: requiredWrap({}),
	strings: requiredWrap({ TransformToStringArray: true, IsArray: true, }),
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
	boolean: requiredWrap({ TransformToBooleanNumber: true }),
	json: requiredWrap({ TransformToJSONObject: true }),
	//
	id: requiredWrap({ TransformToNumber: true, IsInt: true }),
	ids: requiredWrap({
		TransformToNumberArray: true,
		IsArray: true,
		IsInt: { args: [true], options: { each: true } },
	}),
	page: requiredWrap({ TransformToNumber: true, IsInt: true, IsPositive: true }),
	pageSize: requiredWrap({ TransformToNumber: true, IsInt: true, Min: Pre.Min_0() }),
	//用户名
	username: requiredWrap({ Length: Pre.Length_2_3(), IsAlphaNumericDash: true }),
	password: requiredWrap({ Length: Pre.Length_2_3() /*IsMd5: false*/ }),
};

function requiredWrap(v: any) {
	return (required = false) => {
		v[required ? 'Required' : 'IsOptional'] = true;
		return v;
	};
}

export const DtoRules = {
	//base
	string: requiredWrap({ name: 'string' }),
	strings: requiredWrap({ name: 'strings', TransformToStringArray: true, IsArray: true }),
	id: requiredWrap({ name: 'id', IsInt: true }),
	ids: requiredWrap({
		name: 'ids',
		TransformToIntArray: true,
		IsArray: true,
		IsInt: { args: [true], options: { each: true } },
	}),
	//用户名
	username: requiredWrap({ name: 'password', Length: [2, 32], IsAlphaNumericDash: true }),
	password: requiredWrap({ name: 'username', Length: [2, 32] /*IsMd5: false*/ }),
};

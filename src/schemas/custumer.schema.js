import joi from "joi";

const userSchema = joi.object({
	name: joi.string().required().min(1),
	phone: joi.string().required().min(10).max(11),
	cpf: joi
		.string()
		.required()
		.regex(/^\d{11}$/),
	birthday: joi.date().iso().required().raw(),
});

export default userSchema;

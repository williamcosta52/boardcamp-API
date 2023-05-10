import joi from "joi";

export const gameSchema = joi.object({
	name: joi.string().required(),
	stackTotal: joi.number().min(1).required(),
	pricePerDay: joi.number().min(1).required(),
});

import joi from "joi";

const gameSchema = joi.object({
	name: joi.string().min(1).required(),
	image: joi.string().required(),
	stockTotal: joi.number().min(1).required(),
	pricePerDay: joi.number().min(1).required(),
});

export default gameSchema;

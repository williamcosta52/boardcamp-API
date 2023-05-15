export function validateSchema(userSchema) {
	return (req, res, next) => {
		const { name, phone, cpf, birthday } = req.body;

		const validation = userSchema.validate(
			{
				name: name,
				phone: phone,
				cpf: cpf,
				birthday: birthday,
			},
			{ abortEarly: false }
		);
		if (validation.error) {
			const errors = validation.error.details.map((d) => d.message);
			return res.status(400).send(errors);
		}
		next();
	};
}
export function validateGameSchema(gameSchema) {
	return (req, res, next) => {
		const { name, image, stockTotal, pricePerDay } = req.body;
		const validation = gameSchema.validate(
			{
				name: name,
				image: image,
				stockTotal: stockTotal,
				pricePerDay: pricePerDay,
			},
			{ abortEarly: false }
		);
		if (validation.error) {
			const errors = validation.error.details.map((d) => d.message);
			return res.status(400).send(errors);
		}
		next();
	};
}

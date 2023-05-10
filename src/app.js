import express, { json } from "express";
import db from "./database/database.connection.js";
import joi from "joi";

const app = express();
app.use(json());

app.get("/games", async (req, res) => {
	try {
		const gamesList = await db.query("SELECT * FROM games;");
		res.send(gamesList.rows);
	} catch (err) {
		res.status(500).send(err.message);
	}
});
app.post("/games", async (req, res) => {
	const { name, image, stockTotal, pricePerDay } = req.body;
	try {
		const gameSchema = joi.object({
			name: joi.string().min(1).required(),
			image: joi.string().required(),
			stockTotal: joi.number().min(1).required(),
			pricePerDay: joi.number().min(1).required(),
		});
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
		const verifyGame = await db.query(
			`SELECT * FROM games WHERE name='${name}'`
		);
		if (verifyGame.rows.length > 0) return res.sendStatus(409);

		await db.query(
			`INSERT INTO games (name, image, "stockTotal", "pricePerDay") VALUES ($1, $2, $3, $4)`,
			[name, image, stockTotal, pricePerDay]
		);
		res.sendStatus(200);
	} catch (err) {
		res.status(500).send(err.message);
	}
});

app.listen(5000, () => console.log("Rodando na porta 5000"));

import db from "../database/database.connection.js";
import { validateGameSchema } from "../middlewares/validateSchema.middleware.js";

export async function getGames(req, res) {
	try {
		const gamesList = await db.query("SELECT * FROM games;");
		res.send(gamesList.rows);
	} catch (err) {
		res.status(500).send(err.message);
	}
}
export async function postGames(req, res) {
	const { name, image, stockTotal, pricePerDay } = req.body;
	try {
		const verifyGame = await db.query(
			`SELECT * FROM games WHERE name='${name}'`
		);
		if (verifyGame.rows.length > 0) return res.sendStatus(409);
		await db.query(
			`INSERT INTO games (name, image, "stockTotal", "pricePerDay") VALUES ($1, $2, $3, $4)`,
			[name, image, stockTotal, pricePerDay]
		);
		res.sendStatus(201);
	} catch (err) {
		res.status(500).send(err.message);
	}
}

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
app.get("/customers", async (req, res) => {
	try {
		const customersList = await db.query(`SELECT * FROM customers;`);
		res.send(customersList.rows);
	} catch (err) {
		res.send(err.message);
	}
});
app.get("/customers/:id", async (req, res) => {
	const { id } = req.params;

	try {
		const user = await db.query("SELECT * FROM customers WHERE id=$1", [id]);
		if (!user) res.sendStatus(404);
		res.send(user.rows);
	} catch (err) {
		res.send(err.message);
	}
});
app.post("/customers", async (req, res) => {
	const { name, phone, cpf, birthday } = req.body;
	try {
		const userSchema = joi.object({
			name: joi.string().required().min(1),
			phone: joi.string().required().min(10).max(11),
			cpf: joi.string().required().min(11).max(11),
			birthday: joi.date().required(),
		});
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

		const verifyUser = await db.query("SELECT * FROM customers WHERE cpf=$1;", [
			cpf,
		]);
		if (verifyUser) return res.sendStatus(409);

		await db.query(
			"INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4);",
			[name, phone, cpf, birthday]
		);

		res.sendStatus(201);
	} catch (err) {
		res.send(err.message);
	}
});
app.put("/customers/:id", async (req, res) => {
	const { id } = req.params;
	const { name, phone, cpf, birthday } = req.body;

	try {
		const userSchema = joi.object({
			name: joi.string().required().min(1),
			phone: joi.string().required().min(10).max(11),
			cpf: joi.string().required().min(11).max(11),
			birthday: joi.date().required(),
		});
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

		await db.query(
			"UPDATE customers SET name=$1, phone=$2, cpf=$3, birthday=$4 WHERE id=$5;",
			[name, phone, cpf, birthday, id]
		);

		res.sendStatus(200);
	} catch (err) {
		res.send(err.message);
	}
});

app.listen(5000, () => console.log("Rodando na porta 5000"));

import express, { json } from "express";
import db from "./database/database.connection.js";
import joi from "joi";
import dayjs from "dayjs";

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
		res.sendStatus(201);
	} catch (err) {
		res.status(500).send(err.message);
	}
});
app.get("/customers", async (req, res) => {
	try {
		const customersList = await db.query(`SELECT * FROM customers;`);

		const formattedCustomers = customersList.rows.map((customer) => {
			const date = new Date(customer.birthday);
			const formattedDate = date.toLocaleDateString("pt-BR");
			return { ...customer, birthday: formattedDate };
		});

		res.status(200).send(formattedCustomers);
	} catch (err) {
		res.send(err.message);
	}
});
app.get("/customers/:id", async (req, res) => {
	const { id } = req.params;

	try {
		const user = await db.query("SELECT * FROM customers WHERE id=$1", [id]);

		if (user.rows.length === 0) return res.sendStatus(404);

		res.send(user.rows[0]);
	} catch (err) {
		res.send(err.message);
	}
});
app.post("/customers", async (req, res) => {
	const { name, phone, cpf, birthday } = req.body;
	try {
		const verifyUser = await db.query("SELECT * FROM customers WHERE cpf=$1;", [
			cpf,
		]);

		if (verifyUser.rows[0]) return res.sendStatus(409);
		const userSchema = joi.object({
			name: joi.string().required().min(1),
			phone: joi.string().required().min(10).max(11),
			cpf: joi
				.string()
				.required()
				.regex(/^\d{11}$/),
			birthday: joi.date().iso().required().raw(),
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
		const date = new Date(birthday);
		const formattedBirthday = date.toISOString().slice(0, 10);
		await db.query(
			"INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4);",
			[name, phone, cpf, formattedBirthday]
		);
		res.status(201).send();
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
			cpf: joi
				.string()
				.required()
				.regex(/^\d{11}$/),
			birthday: joi.date().iso().required().raw(),
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
		const verifyUser = await db.query(`SELECT * FROM customers WHERE cpf=$1`, [
			cpf,
		]);

		if (id != verifyUser.rows[0].id) return res.sendStatus(409);

		const date = new Date(birthday);
		const formattedBirthday = date.toISOString().slice(0, 10);

		await db.query(
			"UPDATE customers SET name=$1, phone=$2, cpf=$3, birthday=$4 WHERE id=$5;",
			[name, phone, cpf, formattedBirthday, id]
		);

		res.sendStatus(200);
	} catch (err) {
		res.send(err.message);
	}
});
app.get("/rentals", async (req, res) => {
	try {
		const gameRentals =
			await db.query(`SELECT rentals.id, rentals."customerId", rentals."gameId", rentals."rentDate", rentals."daysRented", rentals."returnDate", rentals."originalPrice", rentals."delayFee", customers.name AS "customerName", games.name AS "gameName"
			FROM rentals
			JOIN customers ON rentals."customerId" = customers.id
			JOIN games ON rentals."gameId" = games.id;`);

		const sendRental = gameRentals.rows.map((rental) => {
			const rentalInfo = {
				rentDate: rental.rentDate,
				originalPrice: rental.originalPrice,
				delayFee: rental.delayFee,
			};
			const rentalsInfo = {
				customer: {
					id: rental.customerId,
					name: rental.customerName,
				},
				game: {
					id: rental.gameId,
					name: rental.gameName,
				},
			};
			delete rental.customerName;
			delete rental.gameId;
			delete rental.gameName;
			return {
				...rental,
				...rentalsInfo,
				...rentalInfo,
			};
		});
		res.send(sendRental);
	} catch (err) {
		res.send(err.message);
	}
});
app.post("/rentals", async (req, res) => {
	const { customerId, gameId, daysRented } = req.body;

	if (daysRented <= 0) return res.sendStatus(400);

	try {
		const verifyCustomer = await db.query(
			"SELECT * FROM customers WHERE id=$1;",
			[customerId]
		);
		const verifyGame = await db.query("SELECT * FROM games WHERE id=$1;", [
			gameId,
		]);

		if (verifyGame.rows[0].stockTotal <= 0) return res.sendStatus(400);

		if (!verifyCustomer || !verifyGame) return res.sendStatus(400);

		const price = verifyGame.rows[0].pricePerDay * daysRented;

		await db.query(
			`INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee" ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			[
				verifyCustomer.rows[0].id,
				verifyGame.rows[0].id,
				dayjs().format("YYYY/MM/DD"),
				daysRented,
				null,
				price,
				null,
			]
		);
		const stock = verifyGame.rows[0].stockTotal - 1;

		await db.query(`UPDATE games SET "stockTotal"=$1 WHERE id=$2`, [
			stock,
			verifyGame.rows[0].id,
		]);

		res.sendStatus(201);
	} catch (err) {
		res.send(err.message);
	}
});
app.post("/rentals/:id/return", async (req, res) => {
	const { id } = req.params;

	try {
		res.sendStatus(200);
	} catch (err) {
		res.send(err.message);
	}
});

app.listen(5000, () => console.log("Rodando na porta 5000"));

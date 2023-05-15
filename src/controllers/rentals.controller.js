import db from "../database/database.connection.js";
import dayjs from "dayjs";

export async function getRentals(req, res) {
	try {
		const gameRentals =
			await db.query(`SELECT rentals.id, rentals."customerId", rentals."gameId", rentals."rentDate", rentals."daysRented", rentals."returnDate", rentals."originalPrice", rentals."delayFee", customers.name AS "customerName", games.name AS "gameName"
			FROM rentals
			JOIN customers ON rentals."customerId" = customers.id
			JOIN games ON rentals."gameId" = games.id;`);

		const sendRental = gameRentals.rows.map((rental) => {
			const date = new Date(rental.rentDate);
			const rentalInfo = {
				rentDate: date.toISOString().slice(0, 10),
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
}
export async function postRentals(req, res) {
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
		if (!verifyCustomer.rows.length || !verifyGame.rows.length)
			return res.sendStatus(400);
		const game = verifyGame.rows[0];
		const stockResult = await db.query(
			'SELECT COUNT(*) FROM rentals WHERE "gameId" = $1 AND "returnDate" IS NULL;',
			[gameId]
		);
		const stock = game.stockTotal - stockResult.rows[0].count;
		if (stock <= 0) return res.sendStatus(400);
		const price = game.pricePerDay * daysRented;
		await db.query(
			`INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee" ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			[
				verifyCustomer.rows[0].id,
				game.id,
				dayjs().format(),
				daysRented,
				null,
				price,
				null,
			]
		);
		await db.query(`UPDATE games SET "stockTotal"=$1 WHERE id=$2`, [
			stock,
			game.id,
		]);
		res.sendStatus(201);
	} catch (err) {
		res.send(err.message);
	}
}
export async function postRentalsById(req, res) {
	const { id } = req.params;

	try {
		const verifyRental = await db.query(
			`SELECT r.*, g."pricePerDay"
		FROM rentals r
		JOIN games g ON r."gameId" = g.id
		WHERE r.id =$1;`,
			[id]
		);
		if (verifyRental.rows.length === 0) return res.sendStatus(404);
		if (verifyRental.rows[0].returnDate !== null) return res.sendStatus(400);
		const { rentDate, daysRented, pricePerDay } = verifyRental.rows[0];
		const rentalEnd = new Date();
		const rentalStart = new Date(rentDate);
		const delay =
			(rentalEnd.getTime() - rentalStart.getTime()) / (24 * 60 * 60 * 1000) -
			daysRented;
		const delayFee = delay > 0 ? parseInt(delay) * pricePerDay : 0;
		const date = new Date(dayjs().format("YYYY-MM-DD"));
		const newDate = date.toISOString().slice(0, 10);
		await db.query(
			`UPDATE rentals SET "returnDate"=$1, "delayFee"=$2 WHERE id=$3`,
			[newDate, delayFee, id]
		);
		res.sendStatus(200);
	} catch (err) {
		res.send(err.message);
	}
}
export async function deleteRentals(req, res) {
	const { id } = req.params;

	try {
		const verifyRentals = await db.query(`SELECT * FROM rentals WHERE id=$1`, [
			id,
		]);

		if (verifyRentals.rows.length === 0) res.sendStatus(404);

		if (verifyRentals.rows[0].returnDate === null) {
			return res.sendStatus(400);
		}

		await db.query(`DELETE FROM rentals WHERE id=$1`, [id]);

		res.sendStatus(200);
	} catch (err) {
		res.send(err.message);
	}
}

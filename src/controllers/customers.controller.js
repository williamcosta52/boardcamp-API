import db from "../database/database.connection.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";

export async function getCustomers(req, res) {
	try {
		const customersList = await db.query(`SELECT * FROM customers;`);

		const formattedCustomers = customersList.rows.map((customer) => {
			const date = new Date(customer.birthday);
			const formattedDate = date.toLocaleDateString("fr-CA");
			return { ...customer, birthday: formattedDate };
		});

		res.status(200).send(formattedCustomers);
	} catch (err) {
		res.send(err.message);
	}
}
export async function getCustomersById(req, res) {
	const { id } = req.params;

	try {
		const user = await db.query("SELECT * FROM customers WHERE id=$1", [id]);

		if (user.rows.length === 0) return res.sendStatus(404);

		const formattedCustomer = user.rows.map((customer) => {
			const date = new Date(customer.birthday);
			const formattedDate = date.toLocaleDateString("fr-CA");
			return { ...customer, birthday: formattedDate };
		});

		res.send(formattedCustomer[0]);
	} catch (err) {
		res.send(err.message);
	}
}
export async function postCustomers(req, res) {
	const { name, phone, cpf, birthday } = req.body;
	try {
		const verifyUser = await db.query("SELECT * FROM customers WHERE cpf=$1;", [
			cpf,
		]);
		if (verifyUser.rows[0]) return res.sendStatus(409);
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
}
export async function putCustomers(req, res) {
	const { id } = req.params;
	const { name, phone, cpf, birthday } = req.body;
	try {
		const verifyUser = await db.query(
			`SELECT * FROM customers WHERE id=$1 OR cpf=$2`,
			[id, cpf]
		);
		if (verifyUser.rows.length === 0) return res.sendStatus(409);
		if (Number(id) !== Number(verifyUser.rows[0].id))
			return res.sendStatus(409);
		const date = new Date(birthday);
		const formattedDate = date.toLocaleDateString("fr-CA");
		await db.query(
			"UPDATE customers SET name=$1, phone=$2, cpf=$3, birthday=$4 WHERE id=$5;",
			[name, phone, cpf, formattedDate, id]
		);
		res.sendStatus(200);
	} catch (err) {
		res.send(err.message);
	}
}

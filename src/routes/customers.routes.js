import { Router } from "express";
import {
	getCustomers,
	getCustomersById,
	postCustomers,
	putCustomers,
} from "../controllers/customers.controller.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import userSchema from "../schemas/custumer.schema.js";

const customersRouter = Router();

customersRouter.get("/customers", getCustomers);
customersRouter.get("/customers/:id", getCustomersById);
customersRouter.post("/customers", validateSchema(userSchema), postCustomers);
customersRouter.put("/customers/:id", validateSchema(userSchema), putCustomers);

export default customersRouter;

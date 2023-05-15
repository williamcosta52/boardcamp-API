import { Router } from "express";
import {
	deleteRentals,
	getRentals,
	postRentals,
	postRentalsById,
} from "../controllers/rentals.controller.js";

const rentalsRouter = Router();

rentalsRouter.get("/rentals", getRentals);
rentalsRouter.post("/rentals", postRentals);
rentalsRouter.post("/rentals/:id/return", postRentalsById);
rentalsRouter.delete("/rentals/:id", deleteRentals);

export default rentalsRouter;

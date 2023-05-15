import { Router } from "express";
import customersRouter from "./customers.routes.js";
import rentalsRouter from "./rentals.routes.js";
import gamesRouter from "./games.routes.js";

const router = Router();

router.use(customersRouter);
router.use(rentalsRouter);
router.use(gamesRouter);

export default router;

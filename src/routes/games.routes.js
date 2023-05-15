import { Router } from "express";
import { getGames, postGames } from "../controllers/games.controllers.js";
import { validateGameSchema } from "../middlewares/validateSchema.middleware.js";
import gameSchema from "../schemas/game.schema.js";

const gamesRouter = Router();

gamesRouter.get("/games", getGames);
gamesRouter.post("/games", validateGameSchema(gameSchema), postGames);

export default gamesRouter;

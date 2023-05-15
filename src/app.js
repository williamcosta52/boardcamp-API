import express, { json } from "express";
import router from "./routes/index.routes.js";

export const app = express();
app.use(json());
app.use(router);

app.listen(5000, () => console.log("Rodando na porta 5000"));

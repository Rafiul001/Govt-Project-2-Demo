import type { TAppEnv } from "@/server/types";
import { Hono } from "hono";
import v1Router from "./routes/v1Router";

const app = new Hono<TAppEnv>();

app.route("/api/v1", v1Router);

app.get("/", (c) => c.text("Hono!"));

export default app;

import type { TAppEnv } from "@/server/types";
import { Hono } from "hono";
import adminRouter from "./adminRouter";

const v1Router = new Hono<TAppEnv>();

v1Router.route("/admin", adminRouter);

export default v1Router;

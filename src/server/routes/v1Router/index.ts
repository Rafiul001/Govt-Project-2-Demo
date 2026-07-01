import type { TAppEnv } from "@/server/types";
import { Hono } from "hono";
import adminRouter from "./adminRouter";
import bannerRouter from "./bannerRouter";
import boardOfDirectorsRouter from "./boardOfDirectorsRouter";
import branchRouter from "./branchRouter";
import noticeRouter from "./noticeRouter";

const v1Router = new Hono<TAppEnv>();

v1Router.route("/admin", adminRouter);
v1Router.route("/branch", branchRouter);
v1Router.route("/notice", noticeRouter);
v1Router.route("/board-of-directors", boardOfDirectorsRouter);
v1Router.route("/banner", bannerRouter);

export default v1Router;

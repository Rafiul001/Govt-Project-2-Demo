import type { TAppEnv } from "@/server/types";
import { Hono } from "hono";
import adminRouter from "./adminRouter";
import bannerRouter from "./bannerRouter";
import boardOfDirectorsRouter from "./boardOfDirectorsRouter";
import branchRouter from "./branchRouter";
import eventRouter from "./eventRouter";
import memberCategoryRouter from "./memberCategoryRouter";
import memberRouter from "./memberRouter";
import menuRouter from "./menuRouter";
import navRouter from "./navRouter";
import noticeRouter from "./noticeRouter";
import pageRouter from "./pageRouter";
import submenuRouter from "./submenuRouter";

const v1Router = new Hono<TAppEnv>();

v1Router.route("/admin", adminRouter);
v1Router.route("/branch", branchRouter);
v1Router.route("/notice", noticeRouter);
v1Router.route("/board-of-directors", boardOfDirectorsRouter);
v1Router.route("/banner", bannerRouter);
v1Router.route("/menu", menuRouter);
v1Router.route("/submenu", submenuRouter);
v1Router.route("/page", pageRouter);
v1Router.route("/nav", navRouter);
v1Router.route("/member-category", memberCategoryRouter);
v1Router.route("/member", memberRouter);
v1Router.route("/event", eventRouter);

export default v1Router;

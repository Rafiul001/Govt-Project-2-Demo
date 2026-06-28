import { drizzle } from "drizzle-orm/node-postgres";
import config from "../config";
import { relations } from "./relations";

const db = drizzle(config.DATABASE_URL, { relations });

export default db;

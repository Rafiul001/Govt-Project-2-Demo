/**
 * Bootstrap script: creates the first super admin.
 *
 * Usage:
 *   npm run create-super-admin -- <username> <password> [name]
 */
import db from "@/server/db/client";
import { adminsTable } from "@/server/db/schemas";
import { hashPassword } from "@/server/utils/password";
import { adminType } from "@/shared/types";
import logger from "@/shared/utils/pino-logger";
import { eq } from "drizzle-orm";

const [username, password, name] = process.argv.slice(2);

if (!username || !password) {
  logger.error(
    "Usage: npm run create-super-admin -- <username> <password> [name]",
  );
  process.exit(1);
}

const [existing] = await db
  .select({ id: adminsTable.id })
  .from(adminsTable)
  .where(eq(adminsTable.username, username))
  .limit(1);

if (existing) {
  logger.error(`An admin with username "${username}" already exists`);
  process.exit(1);
}

const [admin] = await db
  .insert(adminsTable)
  .values({
    name: name ?? username,
    username,
    password: await hashPassword(password),
    avatar: "",
    adminType: adminType.SUPER_ADMIN,
  })
  .returning();

logger.info(`Super admin created: ${admin!.username} (id: ${admin!.id})`);
process.exit(0);

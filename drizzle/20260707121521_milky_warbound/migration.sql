ALTER TABLE "pages" ADD COLUMN "menuId" integer;--> statement-breakpoint
ALTER TABLE "pages" ALTER COLUMN "submenuId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_menuId_key" UNIQUE("menuId");--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_menuId_menus_id_fkey" FOREIGN KEY ("menuId") REFERENCES "menus"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_attachment_check" CHECK (("submenuId" IS NULL) <> ("menuId" IS NULL));
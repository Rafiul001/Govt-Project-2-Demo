ALTER TABLE "menus" ADD COLUMN "titleBn" varchar(255);--> statement-breakpoint
ALTER TABLE "menus" ADD COLUMN "titleEn" varchar(255);--> statement-breakpoint
ALTER TABLE "submenus" ADD COLUMN "titleBn" varchar(255);--> statement-breakpoint
ALTER TABLE "submenus" ADD COLUMN "titleEn" varchar(255);--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "bannerTitleBn" varchar(255);--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "bannerTitleEn" varchar(255);--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "contentBn" text;--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "contentEn" text;--> statement-breakpoint
ALTER TABLE "menus" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "submenus" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "pages" DROP COLUMN "bannerTitle";--> statement-breakpoint
ALTER TABLE "pages" DROP COLUMN "content";
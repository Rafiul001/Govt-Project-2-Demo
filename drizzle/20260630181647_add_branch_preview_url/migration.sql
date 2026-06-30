ALTER TABLE "branches" ADD COLUMN "previewUrl" varchar(255);--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_previewUrl_key" UNIQUE("previewUrl");
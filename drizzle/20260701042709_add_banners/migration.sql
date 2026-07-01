CREATE TABLE "banners" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "banners_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"subTitle" varchar(255) NOT NULL,
	"image" varchar(255),
	"order" integer DEFAULT 0 NOT NULL,
	"branchId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "banners" ADD CONSTRAINT "banners_branchId_branches_id_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE;
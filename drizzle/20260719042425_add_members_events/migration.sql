CREATE TABLE "membercategories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "membercategories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nameBn" varchar(255),
	"nameEn" varchar(255),
	"slug" varchar(255) NOT NULL UNIQUE,
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "members_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nameBn" varchar(255),
	"nameEn" varchar(255),
	"designation" varchar(255),
	"photo" varchar(255),
	"mobile" varchar(32),
	"email" varchar(255),
	"order" integer DEFAULT 0 NOT NULL,
	"dateOfBirth" date,
	"bloodGroup" varchar(8),
	"gender" varchar(16),
	"nid" varchar(32),
	"address" text,
	"discipline" varchar(255),
	"jerseyNumber" integer,
	"joiningDate" date,
	"achievements" text,
	"bio" text,
	"categoryId" integer NOT NULL,
	"branchId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"titleBn" varchar(255),
	"titleEn" varchar(255),
	"descriptionBn" text,
	"descriptionEn" text,
	"venue" varchar(255),
	"startAt" timestamp NOT NULL,
	"endAt" timestamp,
	"image" varchar(255),
	"isPublished" boolean DEFAULT true NOT NULL,
	"branchId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_categoryId_membercategories_id_fkey" FOREIGN KEY ("categoryId") REFERENCES "membercategories"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_branchId_branches_id_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_branchId_branches_id_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE;
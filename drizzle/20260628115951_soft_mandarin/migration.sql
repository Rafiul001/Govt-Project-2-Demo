CREATE TYPE "admin_type" AS ENUM('SUPER_ADMIN', 'BRANCH_ADMIN');--> statement-breakpoint
CREATE TYPE "sidebar_position" AS ENUM('left', 'right');--> statement-breakpoint
CREATE TABLE "admins" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admins_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL UNIQUE,
	"password" varchar(255) NOT NULL,
	"avatar" varchar(255) NOT NULL,
	"adminType" "admin_type" DEFAULT 'BRANCH_ADMIN'::"admin_type" NOT NULL,
	"branchId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "branches_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"address" varchar(255) NOT NULL,
	"phone" varchar(50),
	"email" varchar(255),
	"logo" varchar(255),
	"banner" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boardofdirectors" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "boardofdirectors_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"designation" varchar(255) NOT NULL,
	"avatar" varchar(255) NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"branchId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notices" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notices_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"description" text,
	"fileUrl" varchar(255),
	"image" varchar(255),
	"isPublished" boolean DEFAULT true NOT NULL,
	"branchId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "layouts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "layouts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"branchId" integer NOT NULL UNIQUE,
	"showLogo" boolean DEFAULT true NOT NULL,
	"showBanner" boolean DEFAULT true NOT NULL,
	"sidebarPosition" "sidebar_position" DEFAULT 'right'::"sidebar_position" NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_branchId_branches_id_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "boardofdirectors" ADD CONSTRAINT "boardofdirectors_branchId_branches_id_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notices" ADD CONSTRAINT "notices_branchId_branches_id_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "layouts" ADD CONSTRAINT "layouts_branchId_branches_id_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE;
CREATE TABLE "menus" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "menus_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"branchId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "menus_branchId_slug_unique" UNIQUE("branchId","slug")
);
--> statement-breakpoint
CREATE TABLE "submenus" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "submenus_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"menuId" integer NOT NULL,
	"branchId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "submenus_menuId_slug_unique" UNIQUE("menuId","slug")
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"bannerTitle" varchar(255) NOT NULL,
	"bannerImage" varchar(255),
	"content" text DEFAULT '' NOT NULL,
	"isPublished" boolean DEFAULT false NOT NULL,
	"submenuId" integer NOT NULL UNIQUE,
	"branchId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "menus" ADD CONSTRAINT "menus_branchId_branches_id_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "submenus" ADD CONSTRAINT "submenus_menuId_menus_id_fkey" FOREIGN KEY ("menuId") REFERENCES "menus"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "submenus" ADD CONSTRAINT "submenus_branchId_branches_id_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_submenuId_submenus_id_fkey" FOREIGN KEY ("submenuId") REFERENCES "submenus"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_branchId_branches_id_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE;
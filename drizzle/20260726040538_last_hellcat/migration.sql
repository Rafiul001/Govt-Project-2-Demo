ALTER TABLE "branches" ADD COLUMN "aboutTitleBn" varchar(255);--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "aboutTitleEn" varchar(255);--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "aboutSubtitleBn" text;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "aboutSubtitleEn" text;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "aboutIntroBn" text;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "aboutIntroEn" text;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "aboutHighlights" jsonb;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "publicFields" jsonb;--> statement-breakpoint
-- The board of directors is no longer a feature of its own: directors are now
-- ordinary members in their own category. Seed that category, copy every board
-- row into it (name → nameBn, avatar → photo), then drop the old table.
--
-- The copy is written so re-running is safe: a director already present in the
-- category for the same branch is skipped.
INSERT INTO "membercategories" ("nameBn", "nameEn", "slug", "order")
VALUES ('পরিচালনা পর্ষদ', 'Board of Directors', 'board-of-directors', -1)
ON CONFLICT ("slug") DO NOTHING;--> statement-breakpoint
INSERT INTO "members" ("nameBn", "designation", "photo", "order", "categoryId", "branchId", "publicFields", "createdAt", "updatedAt")
SELECT
	b."name",
	b."designation",
	b."avatar",
	b."order",
	(SELECT "id" FROM "membercategories" WHERE "slug" = 'board-of-directors'),
	b."branchId",
	-- Directors were public name/designation/photo cards, so nothing extra is
	-- published for them until an admin opts a field in.
	'[]'::jsonb,
	b."createdAt",
	b."updatedAt"
FROM "boardofdirectors" b
WHERE NOT EXISTS (
	SELECT 1 FROM "members" m
	WHERE m."branchId" = b."branchId"
		AND m."nameBn" = b."name"
		AND m."categoryId" = (SELECT "id" FROM "membercategories" WHERE "slug" = 'board-of-directors')
);--> statement-breakpoint
DROP TABLE "boardofdirectors";

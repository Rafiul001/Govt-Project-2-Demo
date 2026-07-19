-- Custom SQL migration file, put your code below! --

-- Seed the four default member categories so every environment has a working
-- Members section out of the box. Super admins can rename/reorder them or add
-- more from the dashboard. Idempotent: re-running skips existing slugs.
INSERT INTO "membercategories" ("nameBn", "nameEn", "slug", "order")
VALUES
	('খেলোয়াড়', 'Players', 'players', 0),
	('কোচ', 'Coaches', 'coaches', 1),
	('কর্মকর্তা', 'Officials', 'officials', 2),
	('ফিজিও', 'Physios', 'physios', 3)
ON CONFLICT ("slug") DO NOTHING;

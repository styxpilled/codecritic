ALTER TABLE "likes_reviews" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "users_follows" ALTER COLUMN "user_id" SET DATA TYPE integer;
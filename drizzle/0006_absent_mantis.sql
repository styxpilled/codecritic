ALTER TABLE "reviews" DROP CONSTRAINT "rating_lt_10";--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "rating_lt_10" CHECK ("reviews"."rating" <= 10);
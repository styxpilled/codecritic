ALTER TABLE "likes_reviews" DROP CONSTRAINT "likes_reviews_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "likes_reviews" DROP CONSTRAINT "likes_reviews_review_id_reviews_id_fk";
--> statement-breakpoint
ALTER TABLE "stacks_packages" DROP CONSTRAINT "stacks_packages_stack_id_stacks_id_fk";
--> statement-breakpoint
ALTER TABLE "stacks_packages" DROP CONSTRAINT "stacks_packages_package_packages_name_fk";
--> statement-breakpoint
ALTER TABLE "likes_reviews" DROP CONSTRAINT "likes_reviews_user_id_review_id_pk";--> statement-breakpoint
ALTER TABLE "stacks_packages" DROP CONSTRAINT "stacks_packages_stack_id_package_pk";
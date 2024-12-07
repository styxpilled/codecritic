CREATE TABLE IF NOT EXISTS "readmes" (
	"name" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "age_check1";--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "reviews_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "author" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "users_follows" ALTER COLUMN "following" SET DATA TYPE integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "readmes" ADD CONSTRAINT "readmes_name_packages_name_fk" FOREIGN KEY ("name") REFERENCES "public"."packages"("name") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "rating_lt_10" CHECK ("reviews"."rating" < 10);
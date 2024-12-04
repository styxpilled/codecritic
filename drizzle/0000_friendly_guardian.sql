CREATE TABLE IF NOT EXISTS "likes_reviews" (
	"user_id" text NOT NULL,
	"review_id" integer,
	CONSTRAINT "likes_reviews_user_id_review_id_pk" PRIMARY KEY("user_id","review_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "packages" (
	"name" text PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"keywords" text[],
	"latest" text NOT NULL,
	"next" text,
	"license" text,
	"repository" text,
	"homepage" text,
	"author" text,
	"public" boolean
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"bio" text,
	"url" text,
	"links" text[]
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reviews" (
	"id" integer PRIMARY KEY NOT NULL,
	"author" text NOT NULL,
	"package" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"version" text NOT NULL,
	"review" text NOT NULL,
	"rating" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stacks" (
	"id" integer PRIMARY KEY NOT NULL,
	"author" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stacks_packages" (
	"stack_id" integer,
	"package" text,
	CONSTRAINT "stacks_packages_stack_id_package_pk" PRIMARY KEY("stack_id","package")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"nickname" text,
	"github_id" numeric NOT NULL,
	CONSTRAINT "users_github_id_unique" UNIQUE("github_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users_follows" (
	"user_id" text NOT NULL,
	"following" text NOT NULL,
	CONSTRAINT "users_follows_user_id_following_pk" PRIMARY KEY("user_id","following")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "likes_reviews" ADD CONSTRAINT "likes_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "likes_reviews" ADD CONSTRAINT "likes_reviews_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_users_id_fk" FOREIGN KEY ("author") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_package_packages_name_fk" FOREIGN KEY ("package") REFERENCES "public"."packages"("name") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stacks_packages" ADD CONSTRAINT "stacks_packages_stack_id_stacks_id_fk" FOREIGN KEY ("stack_id") REFERENCES "public"."stacks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stacks_packages" ADD CONSTRAINT "stacks_packages_package_packages_name_fk" FOREIGN KEY ("package") REFERENCES "public"."packages"("name") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_follows" ADD CONSTRAINT "users_follows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_follows" ADD CONSTRAINT "users_follows_following_users_id_fk" FOREIGN KEY ("following") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

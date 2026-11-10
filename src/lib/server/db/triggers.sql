-- Appended to each new migration by scripts/append-triggers.js. Must stay idempotent.
CREATE TRIGGER IF NOT EXISTS `stacks_likes_count_insert` AFTER INSERT ON `stacks_likes` BEGIN
	UPDATE `stacks` SET `likes` = `likes` + 1 WHERE `id` = NEW.`stack_id`;
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS `stacks_likes_count_delete` AFTER DELETE ON `stacks_likes` BEGIN
	UPDATE `stacks` SET `likes` = `likes` - 1 WHERE `id` = OLD.`stack_id`;
END;
--> statement-breakpoint
UPDATE `stacks` SET `likes` = (SELECT COUNT(*) FROM `stacks_likes` WHERE `stack_id` = `stacks`.`id`)
WHERE `likes` != (SELECT COUNT(*) FROM `stacks_likes` WHERE `stack_id` = `stacks`.`id`);
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS `likes_reviews_count_insert` AFTER INSERT ON `likes_reviews` BEGIN
	UPDATE `reviews` SET `likes` = `likes` + 1 WHERE `id` = NEW.`review_id`;
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS `likes_reviews_count_delete` AFTER DELETE ON `likes_reviews` BEGIN
	UPDATE `reviews` SET `likes` = `likes` - 1 WHERE `id` = OLD.`review_id`;
END;
--> statement-breakpoint
UPDATE `reviews` SET `likes` = (SELECT COUNT(*) FROM `likes_reviews` WHERE `review_id` = `reviews`.`id`)
WHERE `likes` != (SELECT COUNT(*) FROM `likes_reviews` WHERE `review_id` = `reviews`.`id`);

CREATE TABLE `us_draws` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lottery` varchar(32) NOT NULL,
	`drawNumber` int,
	`drawDate` timestamp NOT NULL,
	`numbersMain` json NOT NULL,
	`numberSpecial` int NOT NULL,
	`jackpot` varchar(64),
	`jackpotValue` decimal(15,2),
	`multiplier` int,
	`nextDrawDate` timestamp,
	`nextJackpot` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `us_draws_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `us_stats_number_main` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lottery` varchar(32) NOT NULL,
	`number` int NOT NULL,
	`frequency` int NOT NULL DEFAULT 0,
	`lastDrawn` timestamp,
	`delay` int NOT NULL DEFAULT 0,
	`totalDraws` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `us_stats_number_main_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `us_stats_number_special` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lottery` varchar(32) NOT NULL,
	`number` int NOT NULL,
	`frequency` int NOT NULL DEFAULT 0,
	`lastDrawn` timestamp,
	`delay` int NOT NULL DEFAULT 0,
	`totalDraws` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `us_stats_number_special_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `subscriptions` MODIFY COLUMN `priceMonthly` decimal(10,2) NOT NULL DEFAULT '47.80';--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `planType` varchar(32) DEFAULT 'mensal' NOT NULL;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `mpPaymentId` varchar(128);--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `mpPreferenceId` varchar(128);--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `mpPaymentMethod` varchar(64);
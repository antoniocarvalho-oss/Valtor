CREATE TABLE `game_folders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nome` varchar(100) NOT NULL,
	`descricao` varchar(255),
	`cor` varchar(7) DEFAULT '#16a34a',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_folders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `saved_games` ADD `folderId` int;
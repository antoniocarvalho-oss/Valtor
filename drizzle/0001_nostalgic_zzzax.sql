CREATE TABLE `concursos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`loteriaSlug` varchar(32) NOT NULL,
	`numero` int NOT NULL,
	`dataSorteio` timestamp NOT NULL,
	`dezenas` json NOT NULL,
	`premioEstimado` decimal(15,2),
	`premioAcumulado` boolean NOT NULL DEFAULT false,
	`ganhadores` json,
	`somaDezenas` int,
	`qtdPares` int,
	`qtdImpares` int,
	`qtdPrimos` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `concursos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loterias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(32) NOT NULL,
	`nome` varchar(64) NOT NULL,
	`cor` varchar(16) NOT NULL,
	`minNumero` int NOT NULL,
	`maxNumero` int NOT NULL,
	`qtdNumeros` int NOT NULL,
	`diasSorteio` varchar(128) NOT NULL,
	`horarioSorteio` varchar(8) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loterias_id` PRIMARY KEY(`id`),
	CONSTRAINT `loterias_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `saved_games` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`loteriaSlug` varchar(32) NOT NULL,
	`dezenas` json NOT NULL,
	`nome` varchar(64),
	`score` decimal(5,2),
	`somaDezenas` int,
	`qtdPares` int,
	`qtdImpares` int,
	`qtdPrimos` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_games_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `simulations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`loteriaSlug` varchar(32) NOT NULL,
	`dezenas` json NOT NULL,
	`concursosAnalisados` int NOT NULL,
	`resultado` json NOT NULL,
	`melhorResultado` json,
	`mediaAcertos` decimal(5,3),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `simulations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('active','cancelled','expired') NOT NULL DEFAULT 'active',
	`plan` varchar(32) NOT NULL DEFAULT 'premium',
	`priceMonthly` decimal(10,2) NOT NULL DEFAULT '39.90',
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`cancelledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `layer` enum('2','3') DEFAULT '2' NOT NULL;
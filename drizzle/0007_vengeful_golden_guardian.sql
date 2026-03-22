CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tipo` varchar(32) NOT NULL,
	`titulo` varchar(256) NOT NULL,
	`mensagem` text NOT NULL,
	`loteriaSlug` varchar(32),
	`concursoNumero` int,
	`acertos` int,
	`valorGanho` decimal(15,2),
	`lida` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);

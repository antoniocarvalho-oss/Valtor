ALTER TABLE `saved_games` ADD `apostado` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `saved_games` ADD `concursoApostado` int;--> statement-breakpoint
ALTER TABLE `saved_games` ADD `valorAposta` decimal(10,2);--> statement-breakpoint
ALTER TABLE `saved_games` ADD `valorGanho` decimal(15,2);--> statement-breakpoint
ALTER TABLE `saved_games` ADD `acertos` int;--> statement-breakpoint
ALTER TABLE `saved_games` ADD `conferido` boolean DEFAULT false NOT NULL;
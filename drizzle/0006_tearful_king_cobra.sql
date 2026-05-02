CREATE TABLE `bidStatusHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bidId` int NOT NULL,
	`userId` int NOT NULL,
	`oldStatus` varchar(64),
	`newStatus` varchar(64) NOT NULL,
	`notes` text,
	`changedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bidStatusHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bids` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contractId` varchar(128) NOT NULL,
	`contractTitle` text NOT NULL,
	`contractValue` bigint,
	`bidAmount` bigint,
	`bidStatus` enum('active','won','lost','working_on','submitted') NOT NULL DEFAULT 'active',
	`bidNotes` text,
	`bidDate` timestamp NOT NULL DEFAULT (now()),
	`deadline` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bids_id` PRIMARY KEY(`id`)
);

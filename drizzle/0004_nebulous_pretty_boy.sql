CREATE TABLE `contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`samId` varchar(128) NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`simplifiedDescription` text NOT NULL,
	`agency` varchar(256) NOT NULL,
	`contractType` varchar(128) NOT NULL,
	`simplifiedType` varchar(128) NOT NULL,
	`value` int,
	`deadline` timestamp,
	`difficulty` enum('easy','moderate','hard') NOT NULL,
	`category` varchar(128) NOT NULL,
	`setAside` varchar(128),
	`naicsCode` varchar(10),
	`url` varchar(512),
	`minTierRequired` enum('scout','operator','contractor','prime') NOT NULL DEFAULT 'scout',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contracts_id` PRIMARY KEY(`id`),
	CONSTRAINT `contracts_samId_unique` UNIQUE(`samId`)
);
--> statement-breakpoint
CREATE TABLE `savedContracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contractId` int NOT NULL,
	`notes` text,
	`status` enum('saved','interested','bidding','won','rejected') NOT NULL DEFAULT 'saved',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `savedContracts_id` PRIMARY KEY(`id`)
);

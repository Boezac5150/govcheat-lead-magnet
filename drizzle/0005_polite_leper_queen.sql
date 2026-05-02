CREATE TABLE `alertHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertId` int NOT NULL,
	`contractId` int NOT NULL,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alertHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contractAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`searchKeywords` text NOT NULL,
	`minValue` int,
	`maxValue` int,
	`difficulty` enum('easy','moderate','hard'),
	`category` varchar(128),
	`setAside` varchar(128),
	`minTierRequired` enum('scout','operator','contractor','prime') NOT NULL DEFAULT 'scout',
	`emailFrequency` enum('daily','weekly','instantly') NOT NULL DEFAULT 'daily',
	`isActive` boolean NOT NULL DEFAULT true,
	`lastAlertSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contractAlerts_id` PRIMARY KEY(`id`)
);

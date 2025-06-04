-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jun 04, 2025 at 01:17 AM
-- Server version: 10.11.10-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u882993081_Kapital_System`
--

-- --------------------------------------------------------

--
-- Table structure for table `Conversation_Requests`
--

CREATE TABLE `Conversation_Requests` (
  `request_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `Conversation_Requests`
--
DELIMITER $$
CREATE TRIGGER `prevent_zero_request_id` BEFORE INSERT ON `Conversation_Requests` FOR EACH ROW BEGIN
    IF NEW.request_id = 0 THEN
        SET NEW.request_id = NULL;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_message_visibility` AFTER UPDATE ON `Conversation_Requests` FOR EACH ROW BEGIN
    IF OLD.status != NEW.status THEN
        UPDATE Messages 
        SET request_status = NEW.status
        WHERE sender_id = NEW.sender_id 
        AND receiver_id = NEW.receiver_id
        AND is_intro_message = TRUE;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `Document_Validation_Rules`
--

CREATE TABLE `Document_Validation_Rules` (
  `id` int(11) NOT NULL,
  `document_type` varchar(50) NOT NULL,
  `rule_name` varchar(100) NOT NULL,
  `rule_description` text DEFAULT NULL,
  `validation_regex` varchar(255) DEFAULT NULL,
  `is_required` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `Document_Validation_Rules`
--
DELIMITER $$
CREATE TRIGGER `prevent_zero_validation_rule_id` BEFORE INSERT ON `Document_Validation_Rules` FOR EACH ROW BEGIN
    IF NEW.id = 0 THEN
        SET NEW.id = NULL;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `Document_Verification_History`
--

CREATE TABLE `Document_Verification_History` (
  `id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `previous_status` varchar(20) DEFAULT NULL,
  `new_status` varchar(20) DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `change_reason` text DEFAULT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `Document_Verification_History`
--
DELIMITER $$
CREATE TRIGGER `prevent_zero_verification_history_id` BEFORE INSERT ON `Document_Verification_History` FOR EACH ROW BEGIN
    IF NEW.id = 0 THEN
        SET NEW.id = NULL;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `Entrepreneurs`
--

CREATE TABLE `Entrepreneurs` (
  `entrepreneur_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `Entrepreneurs`
--
DELIMITER $$
CREATE TRIGGER `prevent_zero_entrepreneur_id` BEFORE INSERT ON `Entrepreneurs` FOR EACH ROW BEGIN
    IF NEW.entrepreneur_id = 0 THEN
        SET NEW.entrepreneur_id = NULL;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `Investors`
--

CREATE TABLE `Investors` (
  `investor_id` int(11) NOT NULL,
  `investment_range_min` decimal(15,2) NOT NULL,
  `investment_range_max` decimal(15,2) NOT NULL,
  `preferred_industries` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`preferred_industries`)),
  `preferred_locations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`preferred_locations`)),
  `funding_stage_preferences` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`funding_stage_preferences`)),
  `bio` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `Investors`
--
DELIMITER $$
CREATE TRIGGER `prevent_zero_investor_id` BEFORE INSERT ON `Investors` FOR EACH ROW BEGIN
    IF NEW.investor_id = 0 THEN
        SET NEW.investor_id = NULL;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `Matches`
--

CREATE TABLE `Matches` (
  `match_id` int(11) NOT NULL,
  `startup_id` int(11) NOT NULL,
  `investor_id` int(11) NOT NULL,
  `match_score` decimal(5,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `Matches`
--
DELIMITER $$
CREATE TRIGGER `prevent_zero_match_id` BEFORE INSERT ON `Matches` FOR EACH ROW BEGIN
    IF NEW.match_id = 0 THEN
        SET NEW.match_id = NULL;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `Messages`
--

CREATE TABLE `Messages` (
  `message_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `status` enum('unread','read') DEFAULT 'unread',
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `request_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `is_intro_message` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `Messages`
--
DELIMITER $$
CREATE TRIGGER `create_conversation_request` AFTER INSERT ON `Messages` FOR EACH ROW BEGIN
    IF NEW.is_intro_message = TRUE THEN
        -- Check if a request already exists
        IF NOT EXISTS (
            SELECT 1 FROM Conversation_Requests 
            WHERE sender_id = NEW.sender_id 
            AND receiver_id = NEW.receiver_id
        ) THEN
            INSERT INTO Conversation_Requests (sender_id, receiver_id)
            VALUES (NEW.sender_id, NEW.receiver_id);
        END IF;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `prevent_zero_message_id` BEFORE INSERT ON `Messages` FOR EACH ROW BEGIN
    IF NEW.message_id = 0 THEN
        SET NEW.message_id = NULL;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `Message_Files`
--

CREATE TABLE `Message_Files` (
  `file_id` int(11) NOT NULL,
  `message_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `uploaded_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Notifications`
--

CREATE TABLE `Notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `type` enum('message','application_status','investment_match','job_offer','system_alert','startup_status') NOT NULL,
  `message` text NOT NULL,
  `status` enum('unread','read') DEFAULT 'unread',
  `job_id` int(11) DEFAULT NULL,
  `application_id` int(11) DEFAULT NULL,
  `match_id` int(11) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `Notifications`
--
DELIMITER $$
CREATE TRIGGER `prevent_zero_notification_id` BEFORE INSERT ON `Notifications` FOR EACH ROW BEGIN
    IF NEW.notification_id = 0 THEN
        SET NEW.notification_id = NULL;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `Resumes`
--

CREATE TABLE `Resumes` (
  `resume_id` int(11) NOT NULL,
  `job_seeker_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `Resumes`
--
DELIMITER $$
CREATE TRIGGER `prevent_zero_resume_id` BEFORE INSERT ON `Resumes` FOR EACH ROW BEGIN
    IF NEW.resume_id = 0 THEN
        SET NEW.resume_id = NULL;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `Startups`
--

CREATE TABLE `Startups` (
  `startup_id` int(11) NOT NULL,
  `entrepreneur_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `industry` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `funding_needed` decimal(15,2) DEFAULT NULL,
  `pitch_deck_url` varchar(255) DEFAULT NULL,
  `business_plan_url` varchar(255) DEFAULT NULL,
  `approval_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approval_comment` text DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `funding_stage` enum('startup','seed','series_a','series_b','series_c','exit') NOT NULL,
  `website` varchar(255) DEFAULT NULL,
  `startup_stage` enum('ideation','validation','mvp','growth','maturity') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `Startups`
--
DELIMITER $$
CREATE TRIGGER `prevent_zero_startup_id` BEFORE INSERT ON `Startups` FOR EACH ROW BEGIN
    IF NEW.startup_id = 0 THEN
        SET NEW.startup_id = NULL;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `startup_status_update_notification` AFTER UPDATE ON `Startups` FOR EACH ROW BEGIN
    IF OLD.approval_status != NEW.approval_status THEN
        INSERT INTO Notifications (user_id, sender_id, type, message, status)
        VALUES (
            (SELECT entrepreneur_id FROM Startups WHERE startup_id = NEW.startup_id),
            NULL,
            'startup_status',
            CONCAT('Your startup ', NEW.name, ' has been updated to: ', NEW.approval_status),
            'unread'
        );
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `Startup_Profiles`
--

CREATE TABLE `Startup_Profiles` (
  `startup_profile_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `startup_name` varchar(255) NOT NULL,
  `founding_date` date DEFAULT NULL,
  `team_size` int(11) DEFAULT NULL,
  `funding_stage` varchar(50) DEFAULT NULL,
  `pitch_deck_url` varchar(255) DEFAULT NULL,
  `business_plan_url` varchar(255) DEFAULT NULL,
  `website_url` varchar(255) DEFAULT NULL,
  `development_stage` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `Startup_Profiles`
--
DELIMITER $$
CREATE TRIGGER `prevent_zero_startup_profile_id` BEFORE INSERT ON `Startup_Profiles` FOR EACH ROW BEGIN
    IF NEW.startup_profile_id = 0 THEN
        SET NEW.startup_profile_id = NULL;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `Tickets`
--

CREATE TABLE `Tickets` (
  `ticket_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `type` enum('bug','suggestion','other') NOT NULL,
  `status` enum('open','in-progress','resolved','closed') NOT NULL DEFAULT 'open',
  `admin_notes` text DEFAULT NULL,
  `admin_response` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `Tickets`
--
DELIMITER $$
CREATE TRIGGER `prevent_zero_ticket_id` BEFORE INSERT ON `Tickets` FOR EACH ROW BEGIN
    IF NEW.ticket_id = 0 THEN
        SET NEW.ticket_id = NULL;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('entrepreneur','investor','job_seeker','admin','startup') NOT NULL,
  `verification_status` enum('pending','verified','not approved') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `profile_picture_url` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `introduction` text DEFAULT NULL,
  `accomplishments` text DEFAULT NULL,
  `education` text DEFAULT NULL,
  `employment` text DEFAULT NULL,
  `gender` enum('male','female','other','prefer_not_to_say') DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `public_email` varchar(255) DEFAULT NULL,
  `industry` varchar(255) DEFAULT NULL,
  `show_in_search` tinyint(1) DEFAULT 1,
  `show_in_messages` tinyint(1) DEFAULT 1,
  `show_in_pages` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `Users`
--
DELIMITER $$
CREATE TRIGGER `create_user_social_links` AFTER INSERT ON `Users` FOR EACH ROW BEGIN
    INSERT INTO User_Social_Links (user_id)
    VALUES (NEW.user_id);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `prevent_zero_user_id` BEFORE INSERT ON `Users` FOR EACH ROW BEGIN
    IF NEW.user_id = 0 THEN
        SET NEW.user_id = NULL;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `uservisiblemessages`
--

CREATE ALGORITHM=UNDEFINED DEFINER=`u882993081_tarakikapital`@`127.0.0.1` SQL SECURITY DEFINER VIEW `uservisiblemessages`  AS SELECT `m`.`message_id` AS `message_id`, `m`.`sender_id` AS `sender_id`, `m`.`receiver_id` AS `receiver_id`, `m`.`content` AS `content`, `m`.`status` AS `status`, `m`.`sent_at` AS `sent_at`, `m`.`request_status` AS `request_status`, `m`.`is_intro_message` AS `is_intro_message` FROM (`messages` `m` left join `conversation_requests` `cr` on(`m`.`sender_id` = `cr`.`sender_id` and `m`.`receiver_id` = `cr`.`receiver_id`)) WHERE `m`.`request_status` = 'approved' OR `m`.`is_intro_message` = 1 AND `m`.`request_status` = 'pending' OR `m`.`sender_id` = `m`.`receiver_id` ;

-- --------------------------------------------------------

--
-- Table structure for table `User_Conversations`
--

CREATE TABLE `User_Conversations` (
  `user_id` int(11) NOT NULL,
  `other_user_id` int(11) NOT NULL,
  `muted` tinyint(1) DEFAULT 0,
  `archived` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `User_Social_Links`
--

CREATE TABLE `User_Social_Links` (
  `user_id` int(11) NOT NULL,
  `facebook_url` varchar(255) DEFAULT NULL,
  `twitter_url` varchar(255) DEFAULT NULL,
  `instagram_url` varchar(255) DEFAULT NULL,
  `linkedin_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Valid_Document_Types`
--

CREATE TABLE `Valid_Document_Types` (
  `id` int(11) NOT NULL,
  `type_code` varchar(50) NOT NULL,
  `type_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `Valid_Document_Types`
--
DELIMITER $$
CREATE TRIGGER `prevent_zero_document_type_id` BEFORE INSERT ON `Valid_Document_Types` FOR EACH ROW BEGIN
    IF NEW.id = 0 THEN
        SET NEW.id = NULL;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `Verification_Documents`
--

CREATE TABLE `Verification_Documents` (
  `document_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `document_type` enum('government_id','passport','drivers_license','business_registration','professional_license','tax_certificate','bank_statement','utility_bill','proof_of_address','employment_certificate','educational_certificate','other') NOT NULL,
  `document_number` varchar(100) DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `issuing_authority` varchar(100) DEFAULT NULL,
  `additional_info` text DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `status` enum('pending','approved','not approved') DEFAULT 'pending',
  `rejection_reason` text DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `Verification_Documents`
--
DELIMITER $$
CREATE TRIGGER `prevent_zero_document_id` BEFORE INSERT ON `Verification_Documents` FOR EACH ROW BEGIN
    IF NEW.document_id = 0 THEN
        SET NEW.document_id = NULL;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `track_document_status_changes` AFTER UPDATE ON `Verification_Documents` FOR EACH ROW BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO Document_Verification_History (
            document_id,
            previous_status,
            new_status,
            changed_by,
            change_reason
        ) VALUES (
            NEW.document_id,
            OLD.status,
            NEW.status,
            NEW.reviewed_by,
            NEW.rejection_reason
        );
    END IF;
END
$$
DELIMITER ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Conversation_Requests`
--
ALTER TABLE `Conversation_Requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`),
  ADD KEY `idx_conversation_request_status` (`status`);

--
-- Indexes for table `Document_Validation_Rules`
--
ALTER TABLE `Document_Validation_Rules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Document_Verification_History`
--
ALTER TABLE `Document_Verification_History`
  ADD PRIMARY KEY (`id`),
  ADD KEY `document_id` (`document_id`),
  ADD KEY `changed_by` (`changed_by`);

--
-- Indexes for table `Entrepreneurs`
--
ALTER TABLE `Entrepreneurs`
  ADD PRIMARY KEY (`entrepreneur_id`);

--
-- Indexes for table `Investors`
--
ALTER TABLE `Investors`
  ADD PRIMARY KEY (`investor_id`);

--
-- Indexes for table `Matches`
--
ALTER TABLE `Matches`
  ADD PRIMARY KEY (`match_id`),
  ADD KEY `startup_id` (`startup_id`),
  ADD KEY `investor_id` (`investor_id`);

--
-- Indexes for table `Messages`
--
ALTER TABLE `Messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`),
  ADD KEY `idx_message_request_status` (`request_status`),
  ADD KEY `idx_message_intro` (`is_intro_message`);

--
-- Indexes for table `Message_Files`
--
ALTER TABLE `Message_Files`
  ADD PRIMARY KEY (`file_id`),
  ADD KEY `message_id` (`message_id`);

--
-- Indexes for table `Notifications`
--
ALTER TABLE `Notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `job_id` (`job_id`),
  ADD KEY `application_id` (`application_id`),
  ADD KEY `match_id` (`match_id`);

--
-- Indexes for table `Resumes`
--
ALTER TABLE `Resumes`
  ADD PRIMARY KEY (`resume_id`),
  ADD KEY `idx_job_seeker_active` (`job_seeker_id`,`is_active`);

--
-- Indexes for table `Startups`
--
ALTER TABLE `Startups`
  ADD PRIMARY KEY (`startup_id`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `User_Conversations`
--
ALTER TABLE `User_Conversations`
  ADD PRIMARY KEY (`user_id`,`other_user_id`),
  ADD KEY `other_user_id` (`other_user_id`);

--
-- Indexes for table `Verification_Documents`
--
ALTER TABLE `Verification_Documents`
  ADD PRIMARY KEY (`document_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Conversation_Requests`
--
ALTER TABLE `Conversation_Requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Document_Validation_Rules`
--
ALTER TABLE `Document_Validation_Rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Document_Verification_History`
--
ALTER TABLE `Document_Verification_History`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Entrepreneurs`
--
ALTER TABLE `Entrepreneurs`
  MODIFY `entrepreneur_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Investors`
--
ALTER TABLE `Investors`
  MODIFY `investor_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Matches`
--
ALTER TABLE `Matches`
  MODIFY `match_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Messages`
--
ALTER TABLE `Messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Message_Files`
--
ALTER TABLE `Message_Files`
  MODIFY `file_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Notifications`
--
ALTER TABLE `Notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Resumes`
--
ALTER TABLE `Resumes`
  MODIFY `resume_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Startups`
--
ALTER TABLE `Startups`
  MODIFY `startup_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Verification_Documents`
--
ALTER TABLE `Verification_Documents`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Message_Files`
--
ALTER TABLE `Message_Files`
  ADD CONSTRAINT `Message_Files_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `Messages` (`message_id`);

--
-- Constraints for table `User_Conversations`
--
ALTER TABLE `User_Conversations`
  ADD CONSTRAINT `User_Conversations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `User_Conversations_ibfk_2` FOREIGN KEY (`other_user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

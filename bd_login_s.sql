use bd_login_s;
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `registration_ip` VARCHAR(45) NOT NULL,
  `last_login_ip` VARCHAR(45) NULL,
  `verification_token` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

select * from users;
delete from users where id in (18);
UPDATE users set registration_ip = 999 where id = 8;
UPDATE users set last_login_ip = 999 where id = 9;
drop user eApp@localhost;
CREATE USER eApp@localhost IDENTIFIED BY 'odroid';
create schema entities;

GRANT ALL PRIVILEGES ON entities.* to eApp@localhost IDENTIFIED BY 'odroid' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON entities.* TO eApp@'192.168.15.%' IDENTIFIED BY 'odroid' WITH GRANT OPTION;


userFLUSH PRIVILEGES;

INSERT INTO `user` (`id`, `active`, `password`, `roles`, `user_name`) VALUES (0, b'1', 'odroid', 'ROLE_USER,ROLE_ADMIN', 'admin');user
INSERT INTO `user` (`id`, `active`, `password`, `roles`, `user_name`) VALUES (1, b'1', 'odroid', 'ROLE_USER', 'user');
COMMIT;


thingthinghibernate_sequenceuser

SELECT * FROM entities.useruser
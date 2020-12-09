INSERT INTO entities.user (`id`, `active`, `password`,  `user_name`) VALUES (1, b'1', 'Argos4905', 'claudia');
INSERT INTO entities.user (`id`, `active`, `password`,  `user_name`) VALUES (2, b'1', 'cenicienta', 'cenicienta');

insert into entities.role (`id`, `role_name`) VALUES (1, 'ROLE_ADMIN');
insert into entities.role (`id`, `role_name`) VALUES (2, 'ROLE_USER');

insert into entities.user_roles (`user_id`,`roles_id`) VALUES (1,1);
insert into entities.user_roles (`user_id`,`roles_id`) VALUES (1,2);

COMMIT;

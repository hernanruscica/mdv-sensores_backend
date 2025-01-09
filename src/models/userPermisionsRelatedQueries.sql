USE mdvsrl;
SHOW TABLES;
SELECT * FROM acciones;
SELECT * FROM roles;
SELECT * FROM usuarios_x_ubicaciones_x_roles;

/*Encuentro todas las ubicaciones con usuarios y roles asignados*/
SELECT `ubicaciones`.`id` as ubicaciones_id,`ubicaciones`.`nombre` as ubicaciones_nombre, `ubicaciones`.`descripcion` as ubicaciones_descripcion, `ubicaciones`.`foto` as ubicaciones_foto, `ubicaciones`.`telefono` as ubicaciones_tel,
		`usuarios_x_ubicaciones_x_roles`.`usuarios_id` AS usuarios_id, `usuarios_x_ubicaciones_x_roles`.`roles_id` AS usuarios_roles_id,
        `roles`.`nombre` AS usuarios_nombre_rol
FROM `ubicaciones`
INNER JOIN `usuarios_x_ubicaciones_x_roles` ON `ubicaciones`.`id` = `usuarios_x_ubicaciones_x_roles`.`ubicaciones_id` 
INNER JOIN `roles` ON roles_id = `roles`.`id`;

/*Encuentro todas las ubicaciones donde el usuario tiene algun rol*/
SELECT `ubicaciones`.`id` as ubicaciones_id,`ubicaciones`.`nombre` as ubicaciones_nombre, `ubicaciones`.`descripcion` as ubicaciones_descripcion, `ubicaciones`.`foto` as ubicaciones_foto, `ubicaciones`.`telefono` as ubicaciones_tel,
		`usuarios_x_ubicaciones_x_roles`.`usuarios_id` AS usuarios_id, `usuarios_x_ubicaciones_x_roles`.`roles_id` AS usuarios_roles_id,
        `roles`.`nombre` AS usuarios_nombre_rol
FROM `ubicaciones`
INNER JOIN `usuarios_x_ubicaciones_x_roles` ON `ubicaciones`.`id` = `usuarios_x_ubicaciones_x_roles`.`ubicaciones_id` 
INNER JOIN `roles` ON roles_id = `roles`.`id`
WHERE usuarios_id = 32;

/*Encuentro todas los usuarios que tienen algun rol en la ubicacion*/
SELECT  `usuarios_x_ubicaciones_x_roles`.`usuarios_id` AS usuarios_id, 
		`usuarios_x_ubicaciones_x_roles`.`roles_id` AS usuarios_roles_id,
		`roles`.`nombre` AS usuarios_nombre_rol,
        `usuarios`.`nombre_1`  as usuario_nom_apell,
		`usuarios_x_ubicaciones_x_roles`.`ubicaciones_id` as ubicaciones_id
FROM `usuarios`
INNER JOIN `usuarios_x_ubicaciones_x_roles` ON `usuarios`.`id` = `usuarios_x_ubicaciones_x_roles`.`usuarios_id` 
INNER JOIN `roles` ON roles_id = `roles`.`id`
WHERE ubicaciones_id = 34;


select * from usuarios
inner join usuarios_x_ubicaciones_x_roles on usuarios.id = usuarios_x_ubicaciones_x_roles.usuarios_id
where usuarios.dni='28470359';


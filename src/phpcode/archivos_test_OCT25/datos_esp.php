<?php
include_once ('credenciales_mysql.php');

//  inicializo todo en cero canales digitales
$identificador = 0;
$tiempo_total = 0;
$d1_estado = 0;
$d1_cantidad = 0;
$d1_tiempo = 0;
$d2_estado = 0;
$d2_cantidad = 0;
$d2_tiempo = 0;
$d3_estado = 0;
$d3_cantidad = 0;
$d3_tiempo = 0;
$d4_estado = 0;
$d4_cantidad = 0;
$d4_tiempo = 0;
$d5_estado = 0;
$d5_cantidad = 0;
$d5_tiempo = 0;
$d6_estado = 0;
$d6_cantidad = 0;
$d6_tiempo = 0;
$d7_estado = 0;
$d7_cantidad = 0;
$d7_tiempo = 0;
$d8_estado = 0;
$d8_cantidad = 0;
$d8_tiempo = 0;
//  inicializo todo en cero canales analogicos
$a1_inst = 0;
$a1_min = 0;
$a1_max = 0;
$a1_estado = 0;
$a1_cantidad = 0;
$a1_tiempo = 0;
$a2_inst = 0;
$a2_min = 0;
$a2_max = 0;
$a2_estado = 0;
$a2_cantidad = 0;
$a2_tiempo = 0;
$a3_inst = 0;
$a3_min = 0;
$a3_max = 0;
$a3_estado = 0;
$a3_cantidad = 0;
$a3_tiempo = 0;
$a4_inst = 0;
$a4_min = 0;
$a4_max = 0;
$a4_estado = 0;
$a4_cantidad = 0;
$a4_tiempo = 0;
$a5_inst = 0;
$a5_min = 0;
$a5_max = 0;
$a5_estado = 0;
$a5_cantidad = 0;
$a5_tiempo = 0;
//  inicializo todo en cero canales extras
$servicio = 0;
$energia  = 0;
$texto    = 0;

//  Cargo las variables con los valores POST 

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $identificador = $_POST['identificador'];
    $tiempo_total  = $_POST['tiempo_total'];
$d1_estado     = $_POST['d1_estado'];
$d1_cantidad   = $_POST['d1_cantidad'];
$d1_tiempo     = $_POST['d1_tiempo'];
$d2_estado     = $_POST['d2_estado'];
$d2_cantidad   = $_POST['d2_cantidad'];
$d2_tiempo     = $_POST['d2_tiempo'];
$d3_estado     = $_POST['d3_estado'];
$d3_cantidad   = $_POST['d3_cantidad'];
$d3_tiempo     = $_POST['d3_tiempo'];
$d4_estado     = $_POST['d4_estado'];
$d4_cantidad   = $_POST['d4_cantidad'];
$d4_tiempo     = $_POST['d4_tiempo'];
$d5_estado     = $_POST['d5_estado'];
$d5_cantidad   = $_POST['d5_cantidad'];
$d5_tiempo     = $_POST['d5_tiempo'];
$d6_estado     = $_POST['d6_estado'];
$d6_cantidad   = $_POST['d6_cantidad'];
$d6_tiempo     = $_POST['d6_tiempo'];
$d7_estado     = $_POST['d7_estado'];
$d7_cantidad   = $_POST['d7_cantidad'];
$d7_tiempo     = $_POST['d7_tiempo'];
$d8_estado     = $_POST['d8_estado'];
$d8_cantidad   = $_POST['d8_cantidad'];
$d8_tiempo     = $_POST['d8_tiempo'];
//   canales analogicos
$a1_inst     = $_POST['a1_inst'];
$a1_min      = $_POST['a1_min'];
$a1_max      = $_POST['a1_max'];
$a1_estado   = $_POST['a1_estado'];
$a1_cantidad = $_POST['a1_cantidad'];
$a1_tiempo   = $_POST['a1_tiempo'];
$a2_inst     = $_POST['a2_inst'];
$a2_min      = $_POST['a2_min'];
$a2_max      = $_POST['a2_max'];
$a2_estado   = $_POST['a2_estado'];
$a2_cantidad = $_POST['a2_cantidad'];
$a2_tiempo   = $_POST['a2_tiempo'];
$a3_inst     = $_POST['a3_inst'];
$a3_min      = $_POST['a3_min'];
$a3_max      = $_POST['a3_max'];
$a3_estado   = $_POST['a3_estado'];
$a3_cantidad = $_POST['a3_cantidad'];
$a3_tiempo   = $_POST['a3_tiempo'];
$a4_inst     = $_POST['a4_inst'];
$a4_min      = $_POST['a4_min'];
$a4_max      = $_POST['a4_max'];
$a4_estado   = $_POST['a4_estado'];
$a4_cantidad = $_POST['a4_cantidad'];
$a4_tiempo   = $_POST['a4_tiempo'];
$a5_inst     = $_POST['a5_inst'];
$a5_min      = $_POST['a5_min'];
$a5_max      = $_POST['a5_max'];
$a5_estado   = $_POST['a5_estado'];
$a5_cantidad = $_POST['a5_cantidad'];
$a5_tiempo   = $_POST['a5_tiempo'];
//   canales extras
$servicio = $_POST['servicio'];
$energia  = $_POST['energia'];
$texto    = $_POST['texto'];


date_default_timezone_set('America/Argentina/Buenos_Aires');
$d_date = date('Y-m-d H:i:s', time());

// *******   apertura base de datos   *********
$conexion=mysqli_connect($servidorSQL ,$usuario,$password,$base_datos);
mysqli_select_db($conexion,$base_datos);
mysqli_query($conexion,"SET NAMES 'utf8'");
mysqli_query($conexion, "INSERT INTO $tabla (`indice`,`fecha`,`identificador`,`tiempo_total`,
             `d1_estado`,`d1_cantidad`,`d1_tiempo`,
             `d2_estado`,`d2_cantidad`,`d2_tiempo`,
             `d3_estado`,`d3_cantidad`,`d3_tiempo`,  
             `d4_estado`,`d4_cantidad`,`d4_tiempo`,
             `d5_estado`,`d5_cantidad`,`d5_tiempo`,
             `d6_estado`,`d6_cantidad`,`d6_tiempo`, 
             `d7_estado`,`d7_cantidad`,`d7_tiempo`,
             `d8_estado`,`d8_cantidad`,`d8_tiempo`,
             `a1_inst`,`a1_min`,`a1_max`,`a1_estado`,`a1_cantidad`,`a1_tiempo`,
             `a2_inst`,`a2_min`,`a2_max`,`a2_estado`,`a2_cantidad`,`a2_tiempo`,
             `a3_inst`,`a3_min`,`a3_max`,`a3_estado`,`a3_cantidad`,`a3_tiempo`,
             `a4_inst`,`a4_min`,`a4_max`,`a4_estado`,`a4_cantidad`,`a4_tiempo`,
             `a5_inst`,`a5_min`,`a5_max`,`a5_estado`,`a5_cantidad`,`a5_tiempo`,
             `servicio`,`energia`,`texto`)
             VALUES ('NULL','$d_date','$identificador','$tiempo_total',
             '$d1_estado','$d1_cantidad','$d1_tiempo',
             '$d2_estado','$d2_cantidad','$d2_tiempo',
             '$d3_estado','$d3_cantidad','$d3_tiempo',
             '$d4_estado','$d4_cantidad','$d4_tiempo',
             '$d5_estado','$d5_cantidad','$d5_tiempo',
             '$d6_estado','$d6_cantidad','$d6_tiempo',
             '$d7_estado','$d7_cantidad','$d7_tiempo',
             '$d8_estado','$d8_cantidad','$d8_tiempo',
             '$a1_inst','$a1_min','$a1_max','$a1_estado','$a1_cantidad','$a1_tiempo',
             '$a2_inst','$a2_min','$a2_max','$a2_estado','$a2_cantidad','$a2_tiempo',
             '$a3_inst','$a3_min','$a3_max','$a3_estado','$a3_cantidad','$a3_tiempo',
             '$a4_inst','$a4_min','$a4_max','$a4_estado','$a4_cantidad','$a4_tiempo',
             '$a5_inst','$a5_min','$a5_max','$a5_estado','$a5_cantidad','$a5_tiempo',
             '$servicio','$energia','$texto');"  );

    mysqli_close($conexion);

    echo  "datos recibidos<br>";
    flush();

    // *******   apertura base de datos en hostinger  *********
    $conexion_ruscica=mysqli_connect($servidorSQL_ruscica ,$usuario_ruscica,$password_ruscica,$base_datos_ruscica);
    mysqli_select_db($conexion_ruscica,$base_datos_ruscica);
    mysqli_query($conexion_ruscica,"SET NAMES 'utf8'");

    mysqli_query($conexion_ruscica, "INSERT INTO $tabla (`indice`,`fecha`,`identificador`,`tiempo_total`,
                `d1_estado`,`d1_cantidad`,`d1_tiempo`,
                `d2_estado`,`d2_cantidad`,`d2_tiempo`,
                `d3_estado`,`d3_cantidad`,`d3_tiempo`,  
                `d4_estado`,`d4_cantidad`,`d4_tiempo`,
                `d5_estado`,`d5_cantidad`,`d5_tiempo`,
                `d6_estado`,`d6_cantidad`,`d6_tiempo`, 
                `d7_estado`,`d7_cantidad`,`d7_tiempo`,
                `d8_estado`,`d8_cantidad`,`d8_tiempo`,
                `a1_inst`,`a1_min`,`a1_max`,`a1_estado`,`a1_cantidad`,`a1_tiempo`,
                `a2_inst`,`a2_min`,`a2_max`,`a2_estado`,`a2_cantidad`,`a2_tiempo`,
                `a3_inst`,`a3_min`,`a3_max`,`a3_estado`,`a3_cantidad`,`a3_tiempo`,
                `a4_inst`,`a4_min`,`a4_max`,`a4_estado`,`a4_cantidad`,`a4_tiempo`,
                `a5_inst`,`a5_min`,`a5_max`,`a5_estado`,`a5_cantidad`,`a5_tiempo`,
                `servicio`,`energia`,`texto`)
                VALUES ('NULL','$d_date','$identificador','$tiempo_total',
                '$d1_estado','$d1_cantidad','$d1_tiempo',
                '$d2_estado','$d2_cantidad','$d2_tiempo',
                '$d3_estado','$d3_cantidad','$d3_tiempo',
                '$d4_estado','$d4_cantidad','$d4_tiempo',
                '$d5_estado','$d5_cantidad','$d5_tiempo',
                '$d6_estado','$d6_cantidad','$d6_tiempo',
                '$d7_estado','$d7_cantidad','$d7_tiempo',
                '$d8_estado','$d8_cantidad','$d8_tiempo',
                '$a1_inst','$a1_min','$a1_max','$a1_estado','$a1_cantidad','$a1_tiempo',
                '$a2_inst','$a2_min','$a2_max','$a2_estado','$a2_cantidad','$a2_tiempo',
                '$a3_inst','$a3_min','$a3_max','$a3_estado','$a3_cantidad','$a3_tiempo',
                '$a4_inst','$a4_min','$a4_max','$a4_estado','$a4_cantidad','$a4_tiempo',
                '$a5_inst','$a5_min','$a5_max','$a5_estado','$a5_cantidad','$a5_tiempo',
                '$servicio','$energia','$texto');"  );


    mysqli_close($conexion_ruscica);
    // *******   Cierre de la base de datos en hostinger  *********


} else {
    echo "Esperando datos del dispositivo ESP32...";
}


?>

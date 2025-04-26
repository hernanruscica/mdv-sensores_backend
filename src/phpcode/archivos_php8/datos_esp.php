<?php
require_once 'credenciales_mysql.php';

date_default_timezone_set('America/Argentina/Buenos_Aires');

/**
 * Establishes a PDO connection to the database.
 */
function getDatabaseConnection($host, $user, $password, $dbname) {
    try {
        $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8";
        return new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    } catch (PDOException $e) {
        die("Database connection failed: " . $e->getMessage());
    }
}

/**
 * Inserts data into the specified table.
 */
function insertData($pdo, $table, $data) {
    $columns = implode(',', array_keys($data));
    $placeholders = ':' . implode(', :', array_keys($data));
    $sql = "INSERT INTO $table ($columns) VALUES ($placeholders)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($data);
}

// Validate and sanitize POST data
function sanitizeInput($key, $default = 0) {
    return isset($_POST[$key]) ? htmlspecialchars($_POST[$key], ENT_QUOTES, 'UTF-8') : $default;
}

// Collect and sanitize input data
$data = [
    'indice' => null,
    'fecha' => date('Y-m-d H:i:s'),
    'identificador' => sanitizeInput('identificador'),
    'tiempo_total' => sanitizeInput('tiempo_total'),
    'd1_estado' => sanitizeInput('d1_estado'),
    'd1_cantidad' => sanitizeInput('d1_cantidad'),
    'd1_tiempo' => sanitizeInput('d1_tiempo'),
    'd2_estado' => sanitizeInput('d2_estado'),
    'd2_cantidad' => sanitizeInput('d2_cantidad'),
    'd2_tiempo' => sanitizeInput('d2_tiempo'),
    'd3_estado' => sanitizeInput('d3_estado'),
    'd3_cantidad' => sanitizeInput('d3_cantidad'),
    'd3_tiempo' => sanitizeInput('d3_tiempo'),
    'd4_estado' => sanitizeInput('d4_estado'),
    'd4_cantidad' => sanitizeInput('d4_cantidad'),
    'd4_tiempo' => sanitizeInput('d4_tiempo'),
    'd5_estado' => sanitizeInput('d5_estado'),
    'd5_cantidad' => sanitizeInput('d5_cantidad'),
    'd5_tiempo' => sanitizeInput('d5_tiempo'),
    'd6_estado' => sanitizeInput('d6_estado'),
    'd6_cantidad' => sanitizeInput('d6_cantidad'),
    'd6_tiempo' => sanitizeInput('d6_tiempo'),
    'd7_estado' => sanitizeInput('d7_estado'),
    'd7_cantidad' => sanitizeInput('d7_cantidad'),
    'd7_tiempo' => sanitizeInput('d7_tiempo'),
    'd8_estado' => sanitizeInput('d8_estado'),
    'd8_cantidad' => sanitizeInput('d8_cantidad'),
    'd8_tiempo' => sanitizeInput('d8_tiempo'),
    'a1_inst' => sanitizeInput('a1_inst'),
    'a1_min' => sanitizeInput('a1_min'),
    'a1_max' => sanitizeInput('a1_max'),
    'a1_estado' => sanitizeInput('a1_estado'),
    'a1_cantidad' => sanitizeInput('a1_cantidad'),
    'a1_tiempo' => sanitizeInput('a1_tiempo'),
    'a2_inst' => sanitizeInput('a2_inst'),
    'a2_min' => sanitizeInput('a2_min'),
    'a2_max' => sanitizeInput('a2_max'),
    'a2_estado' => sanitizeInput('a2_estado'),
    'a2_cantidad' => sanitizeInput('a2_cantidad'),
    'a2_tiempo' => sanitizeInput('a2_tiempo'),
    'a3_inst' => sanitizeInput('a3_inst'),
    'a3_min' => sanitizeInput('a3_min'),
    'a3_max' => sanitizeInput('a3_max'),
    'a3_estado' => sanitizeInput('a3_estado'),
    'a3_cantidad' => sanitizeInput('a3_cantidad'),
    'a3_tiempo' => sanitizeInput('a3_tiempo'),
    'a4_inst' => sanitizeInput('a4_inst'),
    'a4_min' => sanitizeInput('a4_min'),
    'a4_max' => sanitizeInput('a4_max'),
    'a4_estado' => sanitizeInput('a4_estado'),
    'a4_cantidad' => sanitizeInput('a4_cantidad'),
    'a4_tiempo' => sanitizeInput('a4_tiempo'),
    'a5_inst' => sanitizeInput('a5_inst'),
    'a5_min' => sanitizeInput('a5_min'),
    'a5_max' => sanitizeInput('a5_max'),
    'a5_estado' => sanitizeInput('a5_estado'),
    'a5_cantidad' => sanitizeInput('a5_cantidad'),
    'a5_tiempo' => sanitizeInput('a5_tiempo'),
    'servicio' => sanitizeInput('servicio'),
    'energia' => sanitizeInput('energia'),
    'texto' => sanitizeInput('texto'),
];

// Insert data into the first database
$pdo1 = getDatabaseConnection($servidorSQL, $usuario, $password, $base_datos);
insertData($pdo1, $tabla, $data);

echo "datos recibidos<br>";
flush();

// Insert data into the second database
$pdo2 = getDatabaseConnection($servidorSQL_ruscica, $usuario_ruscica, $password_ruscica, $base_datos_ruscica);
insertData($pdo2, $tabla, $data);

?>
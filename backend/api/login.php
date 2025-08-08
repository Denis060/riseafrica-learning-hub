<?php
// Core files and configuration
include_once '../config/database.php';
include_once '../core/auth.php';

ob_start();

$database = new Database();
$db = $database->connect();
$response = [];

try {
    if (!$db) {
        throw new Exception("Database connection failed.");
    }

    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->email) || !isset($data->password)) {
        throw new Exception("Email and password are required.");
    }

    $email = trim($data->email);
    $password = trim($data->password);

    // Get user by email
    $query = "SELECT id, name, email, password, role, is_admin, is_tutor, email_verified 
              FROM users WHERE email = :email LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    if ($stmt->rowCount() == 0) {
        throw new Exception("Invalid email or password.");
    }

    $user = $stmt->fetch();

    if (!password_verify($password, $user['password'])) {
        throw new Exception("Invalid email or password.");
    }

    if ($user['email_verified'] == '0') {
        throw new Exception("Please verify your email before logging in.");
    }

    // Update last login
    $update_query = "UPDATE users SET last_login = NOW() WHERE id = :id";
    $update_stmt = $db->prepare($update_query);
    $update_stmt->bindParam(':id', $user['id']);
    $update_stmt->execute();

    // Generate token
    $token = AuthHandler::generateToken($user['id'], $user['email']);

    // Remove password from response
    unset($user['password']);

    $response = [
        'success' => true,
        'message' => 'Login successful.',
        'user' => $user,
        'token' => $token
    ];

    http_response_code(200);

} catch (Exception $e) {
    http_response_code(400);
    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];
}

ob_end_clean();
echo json_encode($response);
?>

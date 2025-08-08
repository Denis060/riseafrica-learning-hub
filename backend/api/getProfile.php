<?php
// Core files and configuration
include_once '../config/database.php';
include_once '../core/initialize.php';

ob_start();

// Get the authorization header
$headers = getallheaders();
$auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if (empty($auth_header) || !preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'Authorization header not found or invalid.']);
    exit();
}

$token = $matches[1];
$user_id = null;
if (strpos($token, 'dummy-jwt-for-user-') === 0) {
    $user_id = substr($token, strlen('dummy-jwt-for-user-'));
}

if (!$user_id) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid or malformed token.']);
    exit();
}

$database = new Database();
$db = $database->connect();
$response = [];

try {
    if (!$db) {
        throw new Exception("Database connection failed.");
    }

    $query = 'SELECT id, name, email, bio, avatar_url FROM users WHERE id = :user_id LIMIT 1';
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $user_data = $stmt->fetch(PDO::FETCH_ASSOC);
        $response['success'] = true;
        $response['profile'] = $user_data;
        http_response_code(200);
    } else {
        http_response_code(404);
        $response['error'] = 'User profile not found.';
    }

} catch (Exception $e) {
    http_response_code(500);
    $response['error'] = 'An error occurred while fetching the profile.';
    $response['error_detail'] = $e->getMessage();
}

ob_end_clean();
echo json_encode($response);
?>

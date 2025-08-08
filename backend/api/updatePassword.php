<?php
// Core files and configuration
include_once '../config/database.php';
include_once '../core/initialize.php';

ob_start();

// Get the authorization header and user ID
$headers = getallheaders();
$auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';
if (empty($auth_header) || !preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
    http_response_code(401);
    ob_end_clean();
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
    ob_end_clean();
    echo json_encode(['error' => 'Invalid or malformed token.']);
    exit();
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->current_password) || !isset($data->new_password)) {
    http_response_code(400);
    ob_end_clean();
    echo json_encode(['error' => 'Current and new passwords are required.']);
    exit();
}

$database = new Database();
$db = $database->connect();
$response = [];

try {
    if (!$db) {
        throw new Exception("Database connection failed.");
    }

    // 1. Fetch the user's current hashed password
    $query = 'SELECT password FROM users WHERE id = :user_id';
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();

    if ($stmt->rowCount() == 0) {
        throw new Exception("User not found.");
    }

    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    $current_hash = $user['password'];

    // 2. Verify the current password
    if (!password_verify($data->current_password, $current_hash)) {
        http_response_code(401); // Unauthorized
        throw new Exception("Incorrect current password.");
    }

    // 3. Hash the new password
    $new_password_hash = password_hash($data->new_password, PASSWORD_BCRYPT);

    // 4. Update the password in the database
    $update_query = 'UPDATE users SET password = :new_password WHERE id = :user_id';
    $update_stmt = $db->prepare($update_query);
    $update_stmt->bindParam(':new_password', $new_password_hash);
    $update_stmt->bindParam(':user_id', $user_id);

    if ($update_stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Password updated successfully.';
        http_response_code(200);
    } else {
        throw new Exception("Failed to update password.");
    }

} catch (Exception $e) {
    // Use the existing http_response_code if it was set (e.g., 401)
    if (http_response_code() == 200) {
        http_response_code(400); // Default to Bad Request for other errors
    }
    $response['error'] = $e->getMessage();
}

ob_end_clean();
echo json_encode($response);
?>

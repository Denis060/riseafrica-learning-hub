<?php
// Core files and configuration
include_once '../config/database.php';
include_once '../core/initialize.php';

ob_start();

$database = new Database();
$db = $database->connect();
$response = [];

try {
    if (!$db) {
        throw new Exception("Database connection failed.");
    }

    $token = isset($_GET['token']) ? $_GET['token'] : '';

    if (empty($token)) {
        http_response_code(400); // Bad Request
        throw new Exception('Verification token not provided.');
    }
    
    // Find the user with the given verification token
    $query_find = "SELECT id, is_verified FROM users WHERE verification_token = :token LIMIT 1";
    $stmt_find = $db->prepare($query_find);
    $stmt_find->bindParam(':token', $token);
    $stmt_find->execute();

    if ($stmt_find->rowCount() > 0) {
        $user = $stmt_find->fetch(PDO::FETCH_ASSOC);

        // Check if the user is already verified
        if ($user['is_verified'] == 1) {
            $response['success'] = true;
            $response['message'] = 'This account has already been verified. You can now log in.';
            http_response_code(200);
        } else {
            // If not verified, update the user's status
            $query_update = "UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = :id";
            $stmt_update = $db->prepare($query_update);
            $stmt_update->bindParam(':id', $user['id']);
            
            if ($stmt_update->execute()) {
                $response['success'] = true;
                $response['message'] = 'Email verified successfully! You can now log in.';
                http_response_code(200);
            } else {
                throw new Exception('Failed to update user verification status.');
            }
        }
    } else {
        // No user found with this token
        http_response_code(404); // Not Found
        throw new Exception('Invalid or expired verification token. Please try registering again.');
    }

} catch (Exception $e) {
    if (http_response_code() == 200) {
        http_response_code(500); // Internal Server Error
    }
    $response['success'] = false;
    $response['error'] = $e->getMessage();
}

ob_end_clean();
echo json_encode($response);
?>

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

$database = new Database();
// --- THIS IS THE FIX ---
// Changed getConnection() to the correct method name: connect()
$db = $database->connect();
$response = [];

try {
    if (!$db) {
        throw new Exception("Database connection failed.");
    }

    // The frontend sends data as 'multipart/form-data'
    $name = isset($_POST['name']) ? htmlspecialchars(strip_tags($_POST['name'])) : '';
    $email = isset($_POST['email']) ? htmlspecialchars(strip_tags($_POST['email'])) : '';
    $bio = isset($_POST['bio']) ? htmlspecialchars(strip_tags($_POST['bio'])) : '';

    // Check if new email is already taken by another user
    $email_check_query = 'SELECT id FROM users WHERE email = :email AND id != :user_id';
    $email_stmt = $db->prepare($email_check_query);
    $email_stmt->bindParam(':email', $email);
    $email_stmt->bindParam(':user_id', $user_id);
    $email_stmt->execute();
    if ($email_stmt->rowCount() > 0) {
        throw new Exception("This email address is already in use by another account.");
    }

    // Handle file upload
    $avatar_url = $_POST['current_avatar_url']; // Keep old one by default
    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] == 0) {
        $target_dir = "../uploads/avatars/";
        if (!is_dir($target_dir)) {
            mkdir($target_dir, 0777, true);
        }
        $file_extension = strtolower(pathinfo($_FILES["avatar"]["name"], PATHINFO_EXTENSION));
        $target_file = $target_dir . uniqid('avatar_'. $user_id . '_') . '.' . $file_extension;
        
        $check = getimagesize($_FILES["avatar"]["tmp_name"]);
        if($check !== false) {
            if (move_uploaded_file($_FILES["avatar"]["tmp_name"], $target_file)) {
                $avatar_url = str_replace('../', '', $target_file);
            } else {
                throw new Exception("Sorry, there was an error uploading your file.");
            }
        } else {
            throw new Exception("File is not an image.");
        }
    }

    // Update user in the database
    $update_query = 'UPDATE users SET name = :name, email = :email, bio = :bio, avatar_url = :avatar_url WHERE id = :user_id';
    $update_stmt = $db->prepare($update_query);
    $update_stmt->bindParam(':name', $name);
    $update_stmt->bindParam(':email', $email);
    $update_stmt->bindParam(':bio', $bio);
    $update_stmt->bindParam(':avatar_url', $avatar_url);
    $update_stmt->bindParam(':user_id', $user_id);

    if ($update_stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Profile updated successfully.';
        $response['new_avatar_url'] = $avatar_url;
        http_response_code(200);
    } else {
        throw new Exception("Failed to update profile in the database.");
    }

} catch (Exception $e) {
    http_response_code(400); 
    $response['error'] = $e->getMessage();
}

ob_end_clean();
echo json_encode($response);
?>

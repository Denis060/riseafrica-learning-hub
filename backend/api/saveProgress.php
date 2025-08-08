<?php
include_once '../config/database.php';
include_once '../core/initialize.php';

ob_start();

// --- User Authentication ---
$headers = getallheaders();
$auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';
if (empty($auth_header) || !preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
    http_response_code(401); ob_end_clean(); echo json_encode(['error' => 'Authorization required.']); exit();
}
$token = $matches[1];
$user_id = null;
if (strpos($token, 'dummy-jwt-for-user-') === 0) {
    $user_id = substr($token, strlen('dummy-jwt-for-user-'));
}
if (!$user_id) {
    http_response_code(401); ob_end_clean(); echo json_encode(['error' => 'Invalid token.']); exit();
}

$data = json_decode(file_get_contents("php://input"));
$lesson_id = isset($data->lesson_id) ? intval($data->lesson_id) : 0;

if ($lesson_id <= 0) {
    http_response_code(400); ob_end_clean(); echo json_encode(['error' => 'Invalid lesson ID.']); exit();
}

$database = new Database();
$db = $database->connect();
$response = [];

try {
    // Check if progress for this lesson already exists
    $check_query = "SELECT id FROM user_progress WHERE user_id = :user_id AND lesson_id = :lesson_id";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(':user_id', $user_id);
    $check_stmt->bindParam(':lesson_id', $lesson_id);
    $check_stmt->execute();

    if($check_stmt->rowCount() > 0) {
        http_response_code(200);
        $response = ['success' => true, 'message' => 'Lesson already marked as complete.'];
    } else {
        // Save progress
        $query = "INSERT INTO user_progress (user_id, lesson_id, completed_at) VALUES (:user_id, :lesson_id, NOW())";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':lesson_id', $lesson_id);

        if ($stmt->execute()) {
            http_response_code(201);
            $response = ['success' => true, 'message' => 'Progress saved.'];
        } else {
            throw new Exception("Could not save progress.");
        }
    }

} catch (Exception $e) {
    if(http_response_code() == 200) { http_response_code(500); }
    $response['success'] = false;
    $response['error'] = $e->getMessage();
}

ob_end_clean();
echo json_encode($response);
?>

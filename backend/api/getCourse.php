<?php
// Core files and configuration
include_once '../config/database.php';
include_once '../core/initialize.php';

ob_start();

// --- User Authentication ---
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
    echo json_encode(['error' => 'Invalid token.']);
    exit();
}

// --- Get Course ID ---
$course_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($course_id <= 0) {
    http_response_code(400);
    ob_end_clean();
    echo json_encode(['error' => 'Invalid course ID.']);
    exit();
}

$database = new Database();
$db = $database->connect(); // Correct method name
$response = [];

try {
    if (!$db) {
        throw new Exception("Database connection failed.");
    }

    // 1. Verify that the user is enrolled in this course
    $enroll_check_query = "SELECT * FROM enrollments WHERE user_id = :user_id AND course_id = :course_id";
    $enroll_stmt = $db->prepare($enroll_check_query);
    $enroll_stmt->bindParam(':user_id', $user_id);
    $enroll_stmt->bindParam(':course_id', $course_id);
    $enroll_stmt->execute();

    if ($enroll_stmt->rowCount() == 0) {
        http_response_code(403); // Forbidden
        throw new Exception("You are not enrolled in this course.");
    }

    // 2. Fetch main course details
    $course_query = "SELECT id, title, description, instructor FROM courses WHERE id = :course_id";
    $course_stmt = $db->prepare($course_query);
    $course_stmt->bindParam(':course_id', $course_id);
    $course_stmt->execute();
    $course_data = $course_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$course_data) {
        http_response_code(404);
        throw new Exception("Course not found.");
    }

    // 3. Fetch modules and their lessons for the course
    $modules_query = "SELECT * FROM modules WHERE course_id = :course_id ORDER BY module_order ASC";
    $modules_stmt = $db->prepare($modules_query);
    $modules_stmt->bindParam(':course_id', $course_id);
    $modules_stmt->execute();
    
    $modules = [];
    while ($module_row = $modules_stmt->fetch(PDO::FETCH_ASSOC)) {
        $lessons_query = "SELECT * FROM lessons WHERE module_id = :module_id ORDER BY lesson_order ASC";
        $lessons_stmt = $db->prepare($lessons_query);
        $lessons_stmt->bindParam(':module_id', $module_row['id']);
        $lessons_stmt->execute();
        
        $module_row['lessons'] = $lessons_stmt->fetchAll(PDO::FETCH_ASSOC);
        $modules[] = $module_row;
    }

    $course_data['modules'] = $modules;
    
    $response['success'] = true;
    $response['course'] = $course_data;
    http_response_code(200);

} catch (Exception $e) {
    if (http_response_code() == 200) { http_response_code(500); }
    $response['success'] = false;
    $response['error'] = 'An error occurred while fetching the course.';
    $response['error_detail'] = $e->getMessage();
}

ob_end_clean();
echo json_encode($response);
?>

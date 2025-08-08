<?php
// Core files and configuration
include_once '../config/database.php';
include_once '../core/initialize.php';

ob_start();

// Get user ID from the URL
$user_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($user_id <= 0) {
    http_response_code(400);
    ob_end_clean(); // Clean buffer before exit
    echo json_encode(['error' => 'Invalid user ID provided.']);
    exit();
}

$database = new Database();
$db = $database->connect();
$response = [];

try {
    if (!$db) {
        throw new Exception("Database connection failed.");
    }

    // 1. Fetch public user details
    $user_query = "SELECT id, name, bio, avatar_url, created_at FROM users WHERE id = :user_id";
    $user_stmt = $db->prepare($user_query);
    $user_stmt->bindParam(':user_id', $user_id);
    $user_stmt->execute();

    if ($user_stmt->rowCount() == 0) {
        throw new Exception("User not found.");
    }
    $user_data = $user_stmt->fetch(PDO::FETCH_ASSOC);

    // 2. Fetch completed courses for that user
    $courses_query = "SELECT 
                        c.id, c.title, c.instructor, c.image_url
                      FROM 
                        courses c
                      JOIN 
                        enrollments e ON c.id = e.course_id
                      WHERE 
                        e.user_id = :user_id AND
                        (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) > 0 AND
                        (SELECT COUNT(*) FROM user_progress up WHERE up.user_id = e.user_id AND up.lesson_id IN (SELECT id FROM lessons l2 WHERE l2.course_id = c.id)) >= 
                        (SELECT COUNT(*) FROM lessons l3 WHERE l3.course_id = c.id)";
    
    $courses_stmt = $db->prepare($courses_query);
    $courses_stmt->bindParam(':user_id', $user_id);
    $courses_stmt->execute();
    $completed_courses = $courses_stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Combine and return the data
    $response['success'] = true;
    $response['profile'] = [
        'user' => $user_data,
        'completed_courses' => $completed_courses
    ];
    http_response_code(200);

} catch (Exception $e) {
    http_response_code(500);
    $response['error'] = 'An error occurred while fetching the profile.';
    $response['error_detail'] = $e->getMessage();
}

ob_end_clean();
echo json_encode($response);
?>

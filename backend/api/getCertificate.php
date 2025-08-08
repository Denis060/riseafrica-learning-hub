<?php
// Core files and configuration
include_once '../config/database.php';
include_once '../core/initialize.php';

// Start output buffering to catch any stray errors
ob_start();

// Get the authorization header
$headers = getallheaders();
$auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if (empty($auth_header)) {
    http_response_code(401); // Unauthorized
    echo json_encode(['error' => 'Authorization header not found.']);
    exit();
}

// Check for Bearer token format
if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
    $token = $matches[1];
} else {
    http_response_code(401); // Unauthorized
    echo json_encode(['error' => 'Invalid authorization format.']);
    exit();
}

// Simplified token validation to get user ID
$user_id = null;
if (strpos($token, 'dummy-jwt-for-user-') === 0) {
    $user_id = substr($token, strlen('dummy-jwt-for-user-'));
}

if (!$user_id) {
    http_response_code(401); // Unauthorized
    echo json_encode(['error' => 'Invalid or malformed token.']);
    exit();
}

// Get course ID from the URL
$course_id = isset($_GET['course_id']) ? intval($_GET['course_id']) : 0;

if ($course_id <= 0) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Invalid course ID provided.']);
    exit();
}


$database = new Database();
$db = $database->connect();
$response = [];

try {
    if (!$db) {
        throw new Exception("Database connection failed.");
    }

    // --- FIXED QUERY ---
    // This query now accurately calculates progress using your 'lessons' and 'user_progress' tables.
    $query = 'SELECT 
                u.name as user_name,
                c.title as course_title,
                c.instructor as instructor_name,
                c.skills_covered,
                (SELECT COUNT(*) FROM lessons l WHERE l.course_id = :course_id) as total_lessons,
                (SELECT COUNT(*) FROM user_progress up JOIN lessons l ON up.lesson_id = l.id WHERE up.user_id = :user_id AND l.course_id = :course_id_for_progress) as completed_lessons,
                (SELECT MAX(up.completed_at) FROM user_progress up JOIN lessons l ON up.lesson_id = l.id WHERE up.user_id = :user_id_for_date AND l.course_id = :course_id_for_date) as completion_date
              FROM 
                enrollments e
              JOIN 
                users u ON e.user_id = u.id
              JOIN
                courses c ON e.course_id = c.id
              WHERE 
                e.user_id = :user_id_main AND e.course_id = :course_id_main
              LIMIT 1';

    $stmt = $db->prepare($query);
    $stmt->bindParam(':course_id', $course_id);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':course_id_for_progress', $course_id);
    $stmt->bindParam(':user_id_for_date', $user_id);
    $stmt->bindParam(':course_id_for_date', $course_id);
    $stmt->bindParam(':user_id_main', $user_id);
    $stmt->bindParam(':course_id_main', $course_id);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        // Verify completion
        $progress = 0;
        if ($data['total_lessons'] > 0) {
            $progress = ($data['completed_lessons'] / $data['total_lessons']) * 100;
        }

        if ($progress >= 100) {
            // User is authorized and course is complete
            $response = [
                'success' => true,
                'certificate_data' => [
                    'user_name' => $data['user_name'],
                    'course_title' => $data['course_title'],
                    'instructor_name' => $data['instructor_name'],
                    'skills_covered' => $data['skills_covered'] ? explode(',', $data['skills_covered']) : [],
                    'completion_date' => date('F j, Y', strtotime($data['completion_date']))
                ]
            ];
            http_response_code(200);
        } else {
            // User is enrolled but has not completed the course
            http_response_code(403); // Forbidden
            $response['error'] = 'Access Denied: You have not completed this course yet.';
        }
    } else {
        // User is not enrolled in this course
        http_response_code(403); // Forbidden
        $response['error'] = 'Access Denied: You are not enrolled in this course.';
    }

} catch (Exception $e) {
    http_response_code(500);
    $response['error'] = 'An error occurred while fetching certificate data.';
    $response['error_detail'] = $e->getMessage();
}

ob_end_clean();
echo json_encode($response);
?>

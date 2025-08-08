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

// Check if the header is in the "Bearer <token>" format
if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
    $token = $matches[1];
} else {
    http_response_code(401); // Unauthorized
    echo json_encode(['error' => 'Invalid authorization format.']);
    exit();
}

// Simplified token validation
$user_id = null;
if (strpos($token, 'dummy-jwt-for-user-') === 0) {
    $user_id = substr($token, strlen('dummy-jwt-for-user-'));
}

if (!$user_id) {
    http_response_code(401); // Unauthorized
    echo json_encode(['error' => 'Invalid or malformed token.']);
    exit();
}

$database = new Database();
$db = $database->connect();
$response = ['records' => []];

try {
    if (!$db) {
        throw new Exception("Database connection failed.");
    }

    // --- FIXED QUERY ---
    // This query now calculates progress by comparing total lessons to completed lessons.
    // This assumes you have a 'lessons' table and a 'user_progress' table.
    $query = 'SELECT 
                c.id, 
                c.title, 
                c.instructor, 
                c.image_url,
                c.description,
                (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) as total_lessons,
                (SELECT COUNT(*) FROM user_progress up WHERE up.user_id = e.user_id AND up.lesson_id IN (SELECT id FROM lessons l2 WHERE l2.course_id = c.id)) as completed_lessons
              FROM 
                courses c
              JOIN 
                enrollments e ON c.id = e.course_id
              WHERE 
                e.user_id = :user_id';

    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();

    $num = $stmt->rowCount();

    if ($num > 0) {
        $courses_arr = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);

            // Calculate progress percentage in PHP to avoid division by zero in SQL
            $progress_percentage = 0;
            if ($total_lessons > 0) {
                $progress_percentage = round(($completed_lessons / $total_lessons) * 100);
            }

            $course_item = [
                'id' => $id,
                'title' => $title,
                'description' => $description,
                'instructor' => $instructor,
                'imageUrl' => $image_url,
                'progress' => $progress_percentage // Use the calculated progress
            ];
            array_push($courses_arr, $course_item);
        }
        $response['records'] = $courses_arr;
    }

    http_response_code(200);

} catch (Exception $e) {
    http_response_code(500);
    $response['error'] = 'An error occurred while fetching your courses.';
    $response['error_detail'] = $e->getMessage();
}

ob_end_clean();
echo json_encode($response);
?>

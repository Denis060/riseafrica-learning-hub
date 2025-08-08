<?php
include_once '../core/initialize.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$course_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($course_id > 0 && $user_id > 0) {
    // Get Course Details
    $course_query = "SELECT id, title, instructor, description FROM courses WHERE id = :id LIMIT 1";
    $course_stmt = $db->prepare($course_query);
    $course_stmt->bindParam(':id', $course_id);
    $course_stmt->execute();

    if ($course_stmt->rowCount() > 0) {
        $course_data = $course_stmt->fetch(PDO::FETCH_ASSOC);
        
        // Check if enrolled
        $enrollment_query = "SELECT id FROM enrollments WHERE user_id = :user_id AND course_id = :course_id";
        $enrollment_stmt = $db->prepare($enrollment_query);
        $enrollment_stmt->bindParam(':user_id', $user_id);
        $enrollment_stmt->bindParam(':course_id', $course_id);
        $enrollment_stmt->execute();
        $is_enrolled = $enrollment_stmt->rowCount() > 0;

        $modules_arr = [];
        $completed_lessons_ids = [];

        if ($is_enrolled) {
            // Get User's Progress
            $progress_query = "SELECT lesson_id FROM user_progress up JOIN lessons l ON up.lesson_id = l.id WHERE up.user_id = :user_id AND l.course_id = :course_id";
            $progress_stmt = $db->prepare($progress_query);
            $progress_stmt->bindParam(':user_id', $user_id);
            $progress_stmt->bindParam(':course_id', $course_id);
            $progress_stmt->execute();
            $completed_lessons_ids = $progress_stmt->fetchAll(PDO::FETCH_COLUMN, 0);

            // Get Modules and their Lessons
            $module_query = "SELECT id, title FROM modules WHERE course_id = :course_id ORDER BY module_order ASC";
            $module_stmt = $db->prepare($module_query);
            $module_stmt->bindParam(':course_id', $course_id);
            $module_stmt->execute();

            while ($module_row = $module_stmt->fetch(PDO::FETCH_ASSOC)) {
                $lesson_query = "SELECT id, title, lesson_type, content FROM lessons WHERE module_id = :module_id ORDER BY lesson_order ASC";
                $lesson_stmt = $db->prepare($lesson_query);
                $lesson_stmt->bindParam(':module_id', $module_row['id']);
                $lesson_stmt->execute();
                
                $module_row['lessons'] = $lesson_stmt->fetchAll(PDO::FETCH_ASSOC);
                array_push($modules_arr, $module_row);
            }
        }

        $response_data = array(
            "id" => $course_data['id'],
            "title" => $course_data['title'],
            "instructor" => $course_data['instructor'],
            "description" => html_entity_decode($course_data['description']),
            "isEnrolled" => $is_enrolled,
            "modules" => $modules_arr,
            "completedLessons" => $completed_lessons_ids
        );

        http_response_code(200);
        echo json_encode($response_data);

    } else {
        http_response_code(404);
        echo json_encode(array("message" => "Course not found."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Invalid course ID or user ID."));
}
?>
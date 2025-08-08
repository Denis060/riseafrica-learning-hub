<?php
// Core files and configuration
// The database.php file already handles all CORS headers and sets the content type.
include_once '../config/database.php';
include_once '../core/initialize.php';

// Start output buffering to catch any stray errors or echos
ob_start();

// Instantiate DB & connect
$database = new Database();
$db = $database->connect();

// Match the frontend's expected response structure
$response = ['records' => []]; 

try {
    if (!$db) {
        // Throw an exception if the DB connection failed.
        throw new Exception("Database connection failed.");
    }

    // SQL Query to get courses with instructor name
    // *** FIXED: Removed the JOIN and now selecting the 'instructor' column directly from the 'courses' table. ***
    $query = 'SELECT
                id,
                title,
                description,
                instructor,
                image_url,
                created_at
              FROM
                courses
              ORDER BY
                created_at DESC';

    // Prepare statement
    $stmt = $db->prepare($query);

    // Execute query
    $stmt->execute();

    $num = $stmt->rowCount();

    // Check if any courses exist
    if ($num > 0) {
        $courses_arr = array();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);

            $course_item = array(
                'id' => $id,
                'title' => $title,
                'description' => $description,
                'instructor' => $instructor, // This now comes directly from the courses table
                'imageUrl' => $image_url,
                'created_at' => $created_at
            );

            array_push($courses_arr, $course_item);
        }
        $response['records'] = $courses_arr;
    } else {
        // No courses found, but still a valid response
        $response['message'] = 'No Courses Found';
    }

    http_response_code(200);

} catch (Exception $e) {
    // If any error occurs, catch it and set an error response.
    http_response_code(500); // Internal Server Error
    $response['error'] = 'An error occurred while fetching courses.';
    $response['error_detail'] = $e->getMessage(); // For debugging
}

// Clean the buffer (removes any stray PHP warnings/errors)
ob_end_clean();

// Always output a valid JSON response
echo json_encode($response);

?>

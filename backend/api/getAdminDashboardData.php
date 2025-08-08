<?php
// FILE: backend/api/getAdminDashboardData.php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->admin_id)) {
    http_response_code(400);
    echo json_encode(["message" => "Admin authentication is required."]);
    exit;
}

try {
    // --- Step 1: Verify Admin Role ---
    $admin_id = (int)$data->admin_id;
    $role_query = "SELECT role FROM users WHERE id = :admin_id";
    $role_stmt = $db->prepare($role_query);
    $role_stmt->bindParam(':admin_id', $admin_id);
    $role_stmt->execute();
    $role_result = $role_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$role_result || $role_result['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Access denied."]);
        exit;
    }

    // --- Step 2: Fetch All Dashboard Data ---

    // Stat Cards Data
    $total_users = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $total_courses = $db->query("SELECT COUNT(*) FROM courses")->fetchColumn();
    $total_enrollments = $db->query("SELECT COUNT(*) FROM enrollments")->fetchColumn();
    $active_users_today = $db->query("SELECT COUNT(DISTINCT user_id) FROM user_progress WHERE DATE(completed_at) = CURDATE()")->fetchColumn();

    // Recent Activity Data
    $recent_users = $db->query("SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
    $recent_enrollments_query = "
        SELECT u.name as user_name, c.title as course_title, e.enrolled_at
        FROM enrollments e
        JOIN users u ON e.user_id = u.id
        JOIN courses c ON e.course_id = c.id
        ORDER BY e.enrolled_at DESC LIMIT 5
    ";
    $recent_enrollments = $db->query($recent_enrollments_query)->fetchAll(PDO::FETCH_ASSOC);

    // Chart Data
    $users_by_role_query = "SELECT role, COUNT(*) as count FROM users GROUP BY role";
    $users_by_role = $db->query($users_by_role_query)->fetchAll(PDO::FETCH_ASSOC);


    // Combine all data into a single response
    $dashboard_data = [
        "stats" => [
            "total_users" => (int)$total_users,
            "total_courses" => (int)$total_courses,
            "total_enrollments" => (int)$total_enrollments,
            "active_users_today" => (int)$active_users_today
        ],
        "recent_activity" => [
            "new_users" => $recent_users,
            "new_enrollments" => $recent_enrollments
        ],
        "chart_data" => [
            "users_by_role" => $users_by_role
        ]
    ];

    http_response_code(200);
    echo json_encode($dashboard_data);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "An internal server error occurred.", "error" => $e->getMessage()]);
}
?>

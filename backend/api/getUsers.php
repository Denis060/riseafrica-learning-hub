<?php
// FILE: backend/api/getUsers.php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS"); // This will be a POST request for security
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

// We expect a POST request with the admin's user ID to verify their role
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->admin_id)) {
    http_response_code(400);
    echo json_encode(["message" => "Admin authentication is required."]);
    exit;
}

try {
    // --- Step 1: Verify the requesting user is an admin ---
    $admin_id = (int)$data->admin_id;
    $role_query = "SELECT role FROM users WHERE id = :admin_id";
    $role_stmt = $db->prepare($role_query);
    $role_stmt->bindParam(':admin_id', $admin_id);
    $role_stmt->execute();

    $role_result = $role_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$role_result || $role_result['role'] !== 'admin') {
        http_response_code(403); // Forbidden
        echo json_encode(["message" => "Access denied. You do not have permission to view users."]);
        exit;
    }

    // --- Step 2: If user is an admin, fetch all users ---
    $users_query = "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC";
    $users_stmt = $db->prepare($users_query);
    $users_stmt->execute();

    $num = $users_stmt->rowCount();

    if ($num > 0) {
        $users_arr = [];
        $users_arr["records"] = [];

        while ($row = $users_stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            $user_item = [
                "id" => $id,
                "name" => $name,
                "email" => $email,
                "role" => $role,
                "created_at" => $created_at
            ];
            array_push($users_arr["records"], $user_item);
        }

        http_response_code(200);
        echo json_encode($users_arr);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "No users found."]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "An internal server error occurred.", "error" => $e->getMessage()]);
}
?>

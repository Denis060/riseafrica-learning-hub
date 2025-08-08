
<?php
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

// --- Validation ---
if (!isset($data->admin_id) || !isset($data->user_to_update)) {
    http_response_code(400);
    echo json_encode(["message" => "Admin ID and user data are required."]);
    exit;
}

$user_to_update = $data->user_to_update;

if (empty($user_to_update->id) || empty($user_to_update->name) || empty($user_to_update->email) || empty($user_to_update->role) || empty($user_to_update->status)) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete user data provided."]);
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
        echo json_encode(["message" => "Access denied. You do not have permission."]);
        exit;
    }

    // --- Step 2: If admin is verified, update the target user ---
    $update_query = "UPDATE users SET name = :name, email = :email, role = :role, status = :status WHERE id = :id";
    $update_stmt = $db->prepare($update_query);

    $update_stmt->bindParam(':name', $user_to_update->name);
    $update_stmt->bindParam(':email', $user_to_update->email);
    $update_stmt->bindParam(':role', $user_to_update->role);
    $update_stmt->bindParam(':status', $user_to_update->status);
    $update_stmt->bindParam(':id', $user_to_update->id);

    if ($update_stmt->execute()) {
        http_response_code(200);
        echo json_encode(["message" => "User updated successfully."]);
    } else {
        throw new Exception("Database update failed.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "An internal server error occurred.", "error" => $e->getMessage()]);
}
?>

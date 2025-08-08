<?phpheader("Access-Control-Allow-Origin: http://localhost:3000");
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
if (!isset($data->admin_id) || !isset($data->user_id_to_delete)) {
    http_response_code(400);
    echo json_encode(["message" => "Admin ID and User ID to delete are required."]);
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
    
    // Prevent admin from deleting themselves
    $user_id_to_delete = (int)$data->user_id_to_delete;
    if ($admin_id === $user_id_to_delete) {
        http_response_code(400);
        echo json_encode(["message" => "Admins cannot delete their own account."]);
        exit;
    }

    // --- Step 2: If admin is verified, delete the target user ---
    // For a real-world application, you would also delete related data (enrollments, progress, etc.)
    $delete_query = "DELETE FROM users WHERE id = :id";
    $delete_stmt = $db->prepare($delete_query);
    $delete_stmt->bindParam(':id', $user_id_to_delete);

    if ($delete_stmt->execute()) {
        http_response_code(200);
        echo json_encode(["message" => "User deleted successfully."]);
    } else {
        throw new Exception("Database deletion failed.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "An internal server error occurred.", "error" => $e->getMessage()]);
}
?>

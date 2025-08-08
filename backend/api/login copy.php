<?php
// Core files and configuration
// The database.php file already handles all CORS headers and sets the content type.
include_once '../config/database.php';
include_once '../core/initialize.php';

// Instantiate DB & connect
$database = new Database();
$db = $database->connect();

// Get raw posted data
$data = json_decode(file_get_contents("php://input"));

// Basic validation
if (!isset($data->email) || !isset($data->password)) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
    exit();
}

$email = $data->email;
$password = $data->password;

// --- FIND USER BY EMAIL ---
// *** FIXED: Selecting 'name' column instead of 'full_name' to match your database. ***
$query = "SELECT id, name, email, password, is_verified, role FROM users WHERE email = :email LIMIT 1";
$stmt = $db->prepare($query);
$stmt->bindParam(':email', $email);
$stmt->execute();

if ($stmt->rowCount() == 1) {
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // --- STEP 1: CHECK IF EMAIL IS VERIFIED ---
    if ($user['is_verified'] != '1') {
        http_response_code(403); // Forbidden
        echo json_encode(['success' => false, 'message' => 'Your account is not verified. Please check your email for a verification link.']);
        exit();
    }

    // --- STEP 2: VERIFY PASSWORD (only if verified) ---
    if (password_verify($password, $user['password'])) {
        // Password is correct.
        
        // The frontend expects the user object to have a 'full_name' property.
        // We will create it here for compatibility.
        $user['full_name'] = $user['name'];
        
        // The frontend also expects 'is_admin' based on our previous logic.
        // We will add it based on the 'role' column.
        $user['is_admin'] = ($user['role'] === 'admin') ? '1' : '0';
        unset($user['role']); // Optional: clean up the user object

        // Remove password from the response object for security
        unset($user['password']);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Login successful.',
            'user' => $user,
            'token' => 'dummy-jwt-for-user-' . $user['id']
        ]);
    } else {
        // Invalid password
        http_response_code(401); // Unauthorized
        echo json_encode(['success' => false, 'message' => 'Login failed. Please check your credentials.']);
    }
} else {
    // No user found with that email
    http_response_code(401); // Unauthorized
    echo json_encode(['success' => false, 'message' => 'Login failed. Please check your credentials.']);
}
?>

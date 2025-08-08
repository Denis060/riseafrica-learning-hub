<?php
// backend/cors.php
// Enable CORS and set headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-XSRF-TOKEN");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session if not already started with proper configuration
if (session_status() === PHP_SESSION_NONE) {
    // Configure session cookie parameters
    $sessionParams = [
        'lifetime' => 86400, // 24 hours
        'path' => '/',
        'domain' => 'localhost',
        'secure' => false,   // Set to true if using HTTPS
        'httponly' => true,
        'samesite' => 'Lax'  // Helps with CSRF protection
    ];
    
    session_set_cookie_params($sessionParams);
    
    // Set custom session name if needed
    // session_name('RISEAFRICA_SESSION');
    
    // Start the session
    session_start();
    
    // Regenerate session ID periodically for security
    if (!isset($_SESSION['last_regeneration'])) {
        session_regenerate_id(true);
        $_SESSION['last_regeneration'] = time();
    } elseif (time() - $_SESSION['last_regeneration'] > 1800) { // 30 minutes
        session_regenerate_id(true);
        $_SESSION['last_regeneration'] = time();
    }
}

// Function to get the CSRF token
getCsrfToken();

function getCsrfToken() {
    if (empty($_SESSION['csrf_token'])) {
        if (function_exists('random_bytes')) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        } else {
            $_SESSION['csrf_token'] = bin2hex(openssl_random_pseudo_bytes(32));
        }
    }
    return $_SESSION['csrf_token'];
}

// Function to verify CSRF token
function verifyCsrfToken($token) {
    if (empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
        http_response_code(403);
        echo json_encode(['message' => 'Invalid CSRF token']);
        exit();
    }
    return true;
}

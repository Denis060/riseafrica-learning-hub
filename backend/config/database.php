<?php
// --- START: GLOBAL CORS & HEADER CONFIGURATION ---
// This block should be at the very top of your central include file.

// Allow requests from your React development server.
// In production, you would replace '*' or 'http://localhost:3000' with your actual frontend domain.
header("Access-Control-Allow-Origin: http://localhost:3000"); 

// Specify which HTTP methods are allowed.
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT");

// Specify which headers are allowed in the request.
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Set the content type for all JSON responses.
header("Content-Type: application/json; charset=UTF-8");

// The browser sends a pre-flight OPTIONS request to check CORS settings.
// We need to respond with a 200 OK status to this request.
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
// --- END: GLOBAL CORS & HEADER CONFIGURATION ---


class Database {
    // DB Params
    private $host = 'localhost';
    // --- CORRECTED DATABASE NAME ---
    private $db_name = 'riseafrica_db'; 
    private $username = 'root';
    private $password = 'Denis55522'; // Your actual password
    private $conn;

    // DB Connect
    public function connect() {
        $this->conn = null;

        try {
            $this->conn = new PDO('mysql:host=' . $this->host . ';dbname=' . $this->db_name . ';charset=utf8mb4', 
                                  $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log('Database Connection Error: ' . $e->getMessage());
            throw new Exception('Database connection failed');
        }

        return $this->conn;
    }

    // Legacy method for backward compatibility
    public function getConnection() {
        return $this->connect();
    }
}
?>

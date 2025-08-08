<?php

// Simple login test
header("Content-Type: text/html; charset=UTF-8");

echo "<h1>Login API Test</h1>";

// Test data
$test_email = "dfibrahim18@njala.edu.sl"; // Use the email from the screenshot
$test_password = "your_password_here"; // Replace with actual password

echo "<h3>Testing Login API</h3>";
echo "<p>Email: " . htmlspecialchars($test_email) . "</p>";

try {
    // Simulate the API call
    $url = "http://localhost/riseafrica-hub/backend/api/login.php";
    $data = json_encode([
        "email" => $test_email,
        "password" => $test_password
    ]);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Content-Length: ' . strlen($data)
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "<h3>Response:</h3>";
    echo "<p>HTTP Code: " . $http_code . "</p>";
    echo "<pre>" . htmlspecialchars($response) . "</pre>";

    // Also test database connection
    echo "<h3>Database Test:</h3>";
    include_once 'config/database.php';
    
    $database = new Database();
    $db = $database->getConnection();
    
    if ($db) {
        echo "<p>✅ Database connected</p>";
        
        $query = "SELECT COUNT(*) as count FROM users WHERE email = :email";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $test_email);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo "<p>Users with this email: " . $result['count'] . "</p>";
        
        if ($result['count'] > 0) {
            $query2 = "SELECT id, name, email, is_verified FROM users WHERE email = :email";
            $stmt2 = $db->prepare($query2);
            $stmt2->bindParam(':email', $test_email);
            $stmt2->execute();
            $user = $stmt2->fetch(PDO::FETCH_ASSOC);
            
            echo "<p>User details:</p>";
            echo "<ul>";
            echo "<li>ID: " . $user['id'] . "</li>";
            echo "<li>Name: " . htmlspecialchars($user['name']) . "</li>";
            echo "<li>Email: " . htmlspecialchars($user['email']) . "</li>";
            echo "<li>Verified: " . ($user['is_verified'] ? 'Yes' : 'No') . "</li>";
            echo "</ul>";
        }
    } else {
        echo "<p>❌ Database connection failed</p>";
    }

} catch (Exception $e) {
    echo "<p>❌ Error: " . htmlspecialchars($e->getMessage()) . "</p>";
}
?>
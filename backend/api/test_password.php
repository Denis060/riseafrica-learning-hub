<?php
// Set headers to display the output cleanly in the browser
header('Content-Type: text/plain');

include_once '../config/database.php';

// --- START: CONFIGURE YOUR TEST DATA ---

// 1. Enter the email of a user you recently registered
$test_email = "ibrahimdenisfofanah060@gmail.com"; 

// 2. Enter the plain text password for that user
$test_password = "12345678";

// --- END: CONFIGURE YOUR TEST DATA ---


echo "--- PASSWORD DIAGNOSTIC TEST ---\n\n";

// 1. Check Database Connection
$database = new Database();
$db = $database->connect();
if (!$db) {
    echo "ERROR: Could not connect to the database. Please check your database.php settings.\n";
    exit();
}
echo "Step 1: Database connection successful.\n\n";


// 2. Fetch User Data from Database
echo "Step 2: Fetching user data for email: " . $test_email . "\n";
$query = "SELECT password FROM users WHERE email = :email LIMIT 1";
$stmt = $db->prepare($query);
$stmt->bindParam(':email', $test_email);
$stmt->execute();

if ($stmt->rowCount() == 0) {
    echo "ERROR: No user found with that email address.\n";
    exit();
}

$user = $stmt->fetch(PDO::FETCH_ASSOC);
$stored_hash = $user['password'];

echo "   - Stored Hash in DB: " . $stored_hash . "\n";
echo "   - Length of Stored Hash: " . strlen($stored_hash) . " characters\n\n";

if (strlen($stored_hash) < 60) {
    echo "WARNING: The stored hash is shorter than 60 characters. This often means your 'password' column in the 'users' table is too small. It should be VARCHAR(255).\n\n";
}


// 3. Perform Verification
echo "Step 3: Verifying the password you provided against the stored hash.\n";
echo "   - Plaintext Password Provided: " . $test_password . "\n";

$is_password_correct = password_verify($test_password, $stored_hash);

echo "\n--- FINAL RESULT ---\n";

if ($is_password_correct) {
    echo "SUCCESS! The password is correct. The login issue is likely in the frontend or session handling.\n";
} else {
    echo "FAILURE! The password does not match the stored hash. This is why the login is failing.\n";
    echo "Next Steps:\n";
    echo "1. Double-check that you entered the correct password in this script.\n";
    echo "2. Ensure your database 'password' column is VARCHAR(255).\n";
    echo "3. Register a brand new user and run this test again with the new credentials.\n";
}
?>

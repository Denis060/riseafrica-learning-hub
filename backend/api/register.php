<?php
// Core files and configuration
include_once '../config/database.php';
include_once '../core/initialize.php';

// PHPMailer imports
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require '../vendor/autoload.php';

$database = new Database();
$db = $database->connect();

$data = json_decode(file_get_contents("php://input"));

if (
    !isset($data->full_name) || empty(trim($data->full_name)) ||
    !isset($data->email) || !filter_var($data->email, FILTER_VALIDATE_EMAIL) ||
    !isset($data->password) || empty($data->password)
) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please provide a valid full name, email, and password.']);
    exit();
}

$name = htmlspecialchars(strip_tags($data->full_name));
$email = htmlspecialchars(strip_tags($data->email));
$password = $data->password;

$query_check_email = "SELECT id FROM users WHERE email = :email LIMIT 1";
$stmt_check_email = $db->prepare($query_check_email);
$stmt_check_email->bindParam(':email', $email);
$stmt_check_email->execute();

if ($stmt_check_email->rowCount() > 0) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'An account with this email already exists.']);
    exit();
}

$hashed_password = password_hash($password, PASSWORD_BCRYPT);
try {
    $verification_token = bin2hex(random_bytes(50));
} catch (Exception $e) {
    $verification_token = md5(uniqid($email, true));
}

// Set the default role to 'student'
$query_create_user = "INSERT INTO users (name, email, password, verification_token, role) VALUES (:name, :email, :password, :token, 'student')";
$stmt_create_user = $db->prepare($query_create_user);

$stmt_create_user->bindParam(':name', $name);
$stmt_create_user->bindParam(':email', $email);
$stmt_create_user->bindParam(':password', $hashed_password);
$stmt_create_user->bindParam(':token', $verification_token);

if ($stmt_create_user->execute()) {
    $mail = new PHPMailer(true);
    try {
        // --- SERVER SETTINGS ---
        // You MUST update these with your own email server details.
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com'; // Your SMTP server (e.g., smtp.gmail.com)
        $mail->SMTPAuth   = true;
        $mail->Username   = 'smiletvafrica10@gmail.com'; // Your sending email address
        $mail->Password   = 'yfaidyjhnnyygaah'; // Your Gmail App Password or email password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;

        // Recipients
        $mail->setFrom('smiletvafrica10@gmail.com', 'RiseAfrica Hub');
        $mail->addAddress($email, $name);

        // Content
        $verification_link = "http://localhost:3000/verify-email?token=" . $verification_token;
        $mail->isHTML(true);
        $mail->Subject = 'Verify Your Email for RiseAfrica Hub';
        $mail->Body    = "<h2>Welcome to RiseAfrica Hub!</h2>
                          <p>Dear {$name},</p>
                          <p>Thank you for registering. Please click the button below to verify your email address and activate your account.</p>
                          <a href='{$verification_link}' style='background-color: #0A2463; color: white; padding: 15px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px; font-size: 16px;'>Verify My Account</a>
                          <p>If you did not create an account, no further action is required.</p>";
        $mail->AltBody = "Please click the following link to verify your email address: {$verification_link}";

        $mail->send();
        
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Account created. Please check your email to verify your account.']);

    } catch (Exception $e) {
        http_response_code(500); 
        echo json_encode([
            'success' => false, // Set to false because the core action (emailing) failed
            'message' => 'Account created, but we failed to send a verification email. Please contact support.',
            'error' => $mail->ErrorInfo
        ]);
    }
} else {
    http_response_code(503);
    echo json_encode(['success' => false, 'message' => 'Unable to create user due to a database error.']);
}
?>

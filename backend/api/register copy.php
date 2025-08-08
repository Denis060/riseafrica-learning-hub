<?php
// Include core files
include_once '../core/initialize.php';
include_once '../config/database.php';

// CORRECTED: 'use' statements MUST be inside the <?php tag
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// This path assumes your 'vendor' folder is in the 'backend' directory
require '../vendor/autoload.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->name) && !empty($data->email) && !empty($data->password)) {
    // Check if email already exists
    $query = "SELECT id FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $data->email);
    $stmt->execute();

    if($stmt->rowCount() > 0){
        http_response_code(400);
        echo json_encode(array("message" => "This email address is already registered."));
        exit();
    }

    // Generate a unique verification token
    try {
        $verification_token = bin2hex(random_bytes(50));
    } catch (Exception $e) {
        $verification_token = md5(uniqid($data->email, true));
    }
    
    $password_hash = password_hash($data->password, PASSWORD_BCRYPT);

    $query = "INSERT INTO users (name, email, password, verification_token) VALUES (:name, :email, :password, :token)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":name", $data->name);
    $stmt->bindParam(":email", $data->email);
    $stmt->bindParam(":password", $password_hash);
    $stmt->bindParam(":token", $verification_token);

    if($stmt->execute()){
        // Send verification email using PHPMailer
        $mail = new PHPMailer(true);

        try {
            // --- SERVER SETTINGS WITH DEBUGGING ---
            // Enable verbose debug output to see the entire SMTP conversation
            $mail->SMTPDebug = SMTP::DEBUG_SERVER; 
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            // IMPORTANT: Enter your Gmail address and the App Password
            $mail->Username   = 'smiletvafrica10@gmail.com'; // YOUR EMAIL ADDRESS
            // CORRECTED: The App Password must not have any spaces
            $mail->Password   = 'yfaidyjhnnyygaah'; 
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port       = 465;

            //Recipients
            $mail->setFrom('smiletvafrica10@gmail.com', 'RiseAfrica Hub'); // This should be the same as your Username above
            $mail->addAddress($data->email, $data->name);

            //Content
            $verification_link = "http://localhost:3000/verify-email?token=" . $verification_token;
            $mail->isHTML(true);
            $mail->Subject = 'Verify Your Email for RiseAfrica Hub';
            $mail->Body    = "<h2>Welcome to RiseAfrica Hub!</h2>
                              <p>Dear {$data->name},</p>
                              <p>Thank you for registering. Please click the button below to verify your email address and activate your account.</p>
                              <a href='{$verification_link}' style='background-color: #0A2463; color: white; padding: 15px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px; font-size: 16px;'>Verify My Account</a>
                              <p>If you did not create an account, no further action is required.</p>";
            $mail->AltBody = "Please click the following link to verify your email address: {$verification_link}";

            $mail->send();
            
            http_response_code(201);
            echo json_encode(array("message" => "Account created. Please check your email to verify your account."));

        } catch (Exception $e) {
            http_response_code(500); 
            // The debug output will be sent automatically, but we can also send a JSON error
            echo json_encode(array("message" => "Failed to send verification email. Mailer Error: {$mail->ErrorInfo}"));
        }
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to create user."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>

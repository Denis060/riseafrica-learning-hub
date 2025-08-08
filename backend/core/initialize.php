<?php
// FINAL ATTEMPT: This is a more robust, dynamic CORS handling script.

// Check if the request is coming from a browser
if (isset($_SERVER['HTTP_ORIGIN'])) {
    // Dynamically set the origin to match the request's origin
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

// Handle the pre-flight OPTIONS request sent by browsers
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    }
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }
    exit(0);
}
// Set the content type for all future API responses
header("Content-Type: application/json; charset=UTF-8");
?>
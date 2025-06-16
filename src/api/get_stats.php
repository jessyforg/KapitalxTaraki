<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'localhost';
$dbname = 'taraki_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get total users
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    $totalUsers = $stmt->fetchColumn();

    // Get total startups
    $stmt = $pdo->query("SELECT COUNT(*) FROM startups");
    $totalStartups = $stmt->fetchColumn();

    // Get total entrepreneurs
    $stmt = $pdo->query("SELECT COUNT(*) FROM entrepreneurs");
    $totalEntrepreneurs = $stmt->fetchColumn();

    // Get total investors
    $stmt = $pdo->query("SELECT COUNT(*) FROM investors");
    $totalInvestors = $stmt->fetchColumn();

    // Get total upcoming events
    $stmt = $pdo->query("SELECT COUNT(*) FROM events WHERE event_date >= NOW()");
    $totalUpcomingEvents = $stmt->fetchColumn();

    echo json_encode([
        'total_users' => $totalUsers,
        'total_startups' => $totalStartups,
        'total_entrepreneurs' => $totalEntrepreneurs,
        'total_investors' => $totalInvestors,
        'total_upcoming_events' => $totalUpcomingEvents
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?> 
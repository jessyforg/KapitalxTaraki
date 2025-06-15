<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

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

    echo json_encode([
        'total_users' => $totalUsers,
        'total_startups' => $totalStartups,
        'total_entrepreneurs' => $totalEntrepreneurs,
        'total_investors' => $totalInvestors
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?> 
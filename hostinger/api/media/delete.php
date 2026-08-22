<?php
declare(strict_types=1);

require_once __DIR__ . '/lib.php';

media_handle_preflight();
media_cors();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    media_json(405, ['error' => 'Method not allowed']);
}

$token = media_bearer_token();
if (!$token) {
    media_json(401, ['error' => 'Please log in']);
}

$user = media_verify_user($token);
$userId = (string) $user['id'];

$raw = file_get_contents('php://input') ?: '';
$body = json_decode($raw, true);
$path = is_array($body) ? (string) ($body['path'] ?? '') : '';
$rel = media_safe_rel_path($path);
if (!$rel) {
    media_json(400, ['error' => 'Invalid path']);
}

$parts = explode('/', $rel);
if (($parts[1] ?? '') !== $userId) {
    media_json(403, ['error' => 'Not allowed to delete this file']);
}

$full = rtrim(UPLOAD_ROOT, '/\\') . '/' . $rel;
if (is_file($full)) {
    unlink($full);
}

media_json(200, ['ok' => true]);

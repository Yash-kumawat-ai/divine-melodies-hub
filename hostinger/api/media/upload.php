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
    media_json(401, ['error' => 'Please log in before uploading an image']);
}

$user = media_verify_user($token);
$userId = (string) $user['id'];
media_rate_limit($userId);

$uploadType = (string) ($_POST['uploadType'] ?? 'lyrics');
if (!isset(FOLDER_MAP[$uploadType])) {
    media_json(400, ['error' => 'Invalid upload type']);
}

if (!isset($_FILES['file']) || !is_array($_FILES['file'])) {
    media_json(400, ['error' => 'No file uploaded']);
}

$file = $_FILES['file'];
if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    media_json(400, ['error' => 'File upload failed']);
}

$size = (int) ($file['size'] ?? 0);
if ($size <= 0 || $size > MAX_IMAGE_BYTES) {
    media_json(400, ['error' => 'File exceeds 5MB size limit']);
}

$tmp = (string) ($file['tmp_name'] ?? '');
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($tmp) ?: '';
if (!isset(ALLOWED_MIME[$mime])) {
    media_json(400, ['error' => 'Only JPG, PNG, and WebP files are allowed']);
}

$ext = ALLOWED_MIME[$mime];
$folder = FOLDER_MAP[$uploadType];
$id = media_uuid();
$rel = $folder . '/' . $userId . '/' . $id . '.' . $ext;
$destDir = rtrim(UPLOAD_ROOT, '/\\') . '/' . $folder . '/' . $userId;
if (!is_dir($destDir) && !mkdir($destDir, 0755, true) && !is_dir($destDir)) {
    media_json(500, ['error' => 'Could not create upload folder']);
}

$dest = $destDir . '/' . $id . '.' . $ext;
if (!move_uploaded_file($tmp, $dest)) {
    media_json(500, ['error' => 'Could not save file']);
}

$url = rtrim(PUBLIC_BASE_URL, '/') . '/uploads/' . $rel;
media_json(200, ['url' => $url, 'path' => $rel]);

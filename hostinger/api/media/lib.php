<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

const FOLDER_MAP = [
    'lyrics' => 'bhajans',
    'avatar' => 'avatars',
    'deity' => 'deities',
    'groups' => 'groups',
    'community' => 'community',
];

const ALLOWED_MIME = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
];

function media_json(int $status, array $payload): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload);
    exit;
}

function media_cors(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin && in_array($origin, ALLOWED_ORIGINS, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    } elseif (in_array(PUBLIC_BASE_URL, ALLOWED_ORIGINS, true)) {
        header('Access-Control-Allow-Origin: ' . PUBLIC_BASE_URL);
    }
    header('Access-Control-Allow-Headers: authorization, content-type, apikey');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Max-Age: 86400');
}

function media_handle_preflight(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        media_cors();
        http_response_code(204);
        exit;
    }
}

function media_bearer_token(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(\S+)/i', $header, $m)) {
        return $m[1];
    }
    return null;
}

/** Verify JWT via Supabase Auth (no JWT secret stored in PHP). */
function media_verify_user(string $token): array
{
    $url = rtrim(SUPABASE_URL, '/') . '/auth/v1/user';
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $token,
            'apikey: ' . SUPABASE_ANON_KEY,
        ],
    ]);
    $body = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($code !== 200 || !is_string($body)) {
        media_json(401, ['error' => 'Invalid or expired session']);
    }
    $user = json_decode($body, true);
    if (!is_array($user) || empty($user['id'])) {
        media_json(401, ['error' => 'Invalid or expired session']);
    }
    return $user;
}

function media_uuid(): string
{
    $b = random_bytes(16);
    $b[6] = chr((ord($b[6]) & 0x0f) | 0x40);
    $b[8] = chr((ord($b[8]) & 0x3f) | 0x80);
    $hex = bin2hex($b);
    return sprintf(
        '%s-%s-%s-%s-%s',
        substr($hex, 0, 8),
        substr($hex, 8, 4),
        substr($hex, 12, 4),
        substr($hex, 16, 4),
        substr($hex, 20, 12)
    );
}

function media_rate_limit(string $userId): void
{
    $dir = rtrim(UPLOAD_ROOT, '/\\') . '/.rate';
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        return;
    }
    $file = $dir . '/' . preg_replace('/[^a-zA-Z0-9_-]/', '', $userId) . '.json';
    $now = time();
    $window = 3600;
    $hits = [];
    if (is_file($file)) {
        $raw = json_decode((string) file_get_contents($file), true);
        if (is_array($raw)) {
            $hits = array_values(array_filter($raw, static fn ($t) => is_int($t) && $t > $now - $window));
        }
    }
    if (count($hits) >= RATE_LIMIT_PER_HOUR) {
        media_json(429, ['error' => 'Too many uploads. Try again later.']);
    }
    $hits[] = $now;
    file_put_contents($file, json_encode($hits), LOCK_EX);
}

function media_safe_rel_path(string $rel): ?string
{
    $rel = str_replace('\\', '/', $rel);
    $rel = ltrim($rel, '/');
    if ($rel === '' || str_contains($rel, '..')) {
        return null;
    }
    if (!preg_match('#^(bhajans|avatars|deities|groups|community)/[a-zA-Z0-9_-]+/[a-zA-Z0-9._-]+$#', $rel)) {
        return null;
    }
    return $rel;
}

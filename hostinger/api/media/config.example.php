<?php
/**
 * Copy to config.php on the server. Do not commit config.php.
 */
declare(strict_types=1);

const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY';

/** Public site origin (no trailing slash). */
const PUBLIC_BASE_URL = 'https://raghavam.online';

/** Absolute path to public_html/uploads when this file lives in public_html/api/media/ */
const UPLOAD_ROOT = __DIR__ . '/../../uploads';

const ALLOWED_ORIGINS = [
    'https://raghavam.online',
    'https://www.raghavam.online',
];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const RATE_LIMIT_PER_HOUR = 40;

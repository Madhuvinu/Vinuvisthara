<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. Feel free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => array_filter(array_merge(
        // Production origins
        env('APP_ENV') === 'production' ? [
            'https://vinuvisthara.com',
            'https://www.vinuvisthara.com',
            env('FRONTEND_URL'), // Allow dynamic frontend URL from env
        ] : [],
        // Development origins (only in non-production)
        env('APP_ENV') !== 'production' ? [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
        ] : [],
        // Always allow Vercel frontend if set
        env('FRONTEND_VERCEL_URL') ? [env('FRONTEND_VERCEL_URL')] : [],
    )),

    'allowed_origins_patterns' => [
        '#^https://.*\.vercel\.app$#',  // Vercel preview deployments
        '#^https://.*\.railway\.app$#',  // Railway domains
    ],

    'allowed_headers' => ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin'],

    'exposed_headers' => [],

    'max_age' => 86400, // 24 hours

    'supports_credentials' => false, // Must be false when using wildcard or multiple origins

];

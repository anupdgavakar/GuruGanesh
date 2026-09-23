<?php

return [

    // Every route starting with api/ goes through CORS checks; nothing else needs to.
    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    // Real origins only, driven by .env so staging/local/production never share a list.
    // The old config listed 'https://api.guruganeshgraphics.com/api' as an "origin" —
    // an Origin header is scheme+host+port only, never a path, so that entry never
    // matched anything and was dead configuration.
    'allowed_origins' => array_filter(explode(',', env('CORS_ALLOWED_ORIGINS', ''))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Bearer-token auth doesn't need cookies sent cross-site.
    'supports_credentials' => false,

];

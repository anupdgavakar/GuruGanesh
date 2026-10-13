<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('welcome');
});

// Product / category / blog pictures.
//
// Normally the web server hands /storage/* straight to the files on disk.
// On shared hosting that doesn't always work (symlinks not followed), so
// Laravel serves them itself from the public disk. If the web server does
// serve the file directly, this route is simply never reached.
Route::get('/storage/{path}', function (string $path) {
    $disk = Storage::disk('public');

    abort_unless($disk->exists($path), 404);

    return $disk->response($path, null, [
        'Cache-Control' => 'public, max-age=2592000',
    ]);
})->where('path', '.*');

<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CallController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::match(['post', 'patch'], '/user', [AuthController::class, 'updateProfile']);

    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::get('/search-users', [UserController::class, 'search']);

    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::get('/conversations/{conversation}', [ConversationController::class, 'show']);
    Route::post('/conversations/{conversation}/typing', [ConversationController::class, 'typing']);
    Route::post('/conversations/{conversation}/stop-typing', [ConversationController::class, 'stopTyping']);

    Route::post('/messages', [MessageController::class, 'send'])->middleware('throttle:60,1');
    Route::post('/messages/upload', [MessageController::class, 'uploadFile']);
    Route::get('/messages/{conversation}', [MessageController::class, 'index']);
    Route::delete('/messages/{message}', [MessageController::class, 'destroy']);

    // Call routes (WebRTC signaling)
    Route::post('/call/initiate', [CallController::class, 'initiate']);
    Route::post('/call/accept', [CallController::class, 'accept']);
    Route::post('/call/reject', [CallController::class, 'reject']);
    Route::post('/call/end', [CallController::class, 'end']);
    Route::post('/call/ice-candidate', [CallController::class, 'iceCandidate']);
});

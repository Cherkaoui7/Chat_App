<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Events\MessageDeleted;
use App\Http\Controllers\Controller;
use App\Http\Requests\Message\SendMessageRequest;
use App\Http\Requests\Message\UploadFileRequest;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    public function send(SendMessageRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $conversation = Conversation::query()->findOrFail($validated['conversation_id']);

        if (!$conversation->users()->whereKey($request->user()->id)->exists()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $request->user()->id,
            'message' => $validated['message'],
            'type' => $validated['type'] ?? 'text',
            'seen' => false,
        ]);

        $message->load('sender:id,name,email,avatar');

        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message, 201);
    }

    public function uploadFile(UploadFileRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $conversation = Conversation::query()->findOrFail($validated['conversation_id']);

        if (!$conversation->users()->whereKey($request->user()->id)->exists()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $file = $request->file('file');
        $fileName = $file->getClientOriginalName();
        $filePath = $file->store('messages', 'public');
        $fileMimeType = $file->getMimeType();
        $fileSize = $file->getSize();

        // Determine message type based on file mime type
        $type = 'file';
        $messageText = $fileName;
        if (str_starts_with($fileMimeType, 'image/')) {
            $type = 'image';
        } elseif (str_starts_with($fileMimeType, 'video/')) {
            $type = 'video';
        } elseif (str_starts_with($fileMimeType, 'audio/')) {
            $type = 'audio';
            $messageText = 'Voice message';
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $request->user()->id,
            'message' => $messageText,
            'type' => $type,
            'file_path' => $filePath,
            'file_name' => $fileName,
            'file_mime_type' => $fileMimeType,
            'file_size' => $fileSize,
            'seen' => false,
        ]);

        $message->load('sender:id,name,email,avatar');

        broadcast(new MessageSent($message))->toOthers();

        return response()->json([
            'message' => $message,
            'file_url' => Storage::url($filePath),
        ], 201);
    }

    public function index(Request $request, Conversation $conversation): JsonResponse
    {
        if (!$conversation->users()->whereKey($request->user()->id)->exists()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $perPage = min(max($request->integer('per_page', 30), 1), 100);

        $messages = $conversation->messages()
            ->with('sender:id,name,email,avatar')
            ->orderByDesc('id')
            ->paginate($perPage);

        return response()->json($messages);
    }
}

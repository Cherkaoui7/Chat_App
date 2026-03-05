<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Message\SendMessageRequest;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

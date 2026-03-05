<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Conversation\StoreConversationRequest;
use App\Models\Conversation;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max($request->integer('per_page', 20), 1), 100);

        $conversations = $request->user()
            ->conversations()
            ->with([
                'users:id,name,email,avatar,last_seen',
                'latestMessage.sender:id,name,email,avatar',
            ])
            ->withCount('messages')
            ->withMax('messages', 'created_at')
            ->orderByDesc('messages_max_created_at')
            ->orderByDesc('updated_at')
            ->paginate($perPage);

        return response()->json($conversations);
    }

    public function store(StoreConversationRequest $request): JsonResponse
    {
        $userId = $request->user()->id;
        $participantId = (int) $request->integer('participant_id');

        if ($participantId === $userId) {
            return response()->json([
                'message' => 'You cannot start a conversation with yourself',
                'errors' => [
                    'participant_id' => ['Participant must be a different user'],
                ],
            ], 422);
        }

        $conversation = Conversation::query()
            ->where('type', 'private')
            ->whereHas('users', fn (Builder $query) => $query->where('users.id', $userId))
            ->whereHas('users', fn (Builder $query) => $query->where('users.id', $participantId))
            ->has('users', '=', 2)
            ->first();

        if (! $conversation) {
            $conversation = Conversation::create([
                'type' => 'private',
            ]);

            $conversation->users()->attach([$userId, $participantId]);
        }

        $conversation->load('users:id,name,email,avatar,last_seen');

        return response()->json($conversation, $conversation->wasRecentlyCreated ? 201 : 200);
    }

    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        if (! $conversation->users()->whereKey($request->user()->id)->exists()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $conversation->load('users:id,name,email,avatar,last_seen');

        return response()->json($conversation);
    }
}

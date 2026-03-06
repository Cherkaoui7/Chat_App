<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CallController extends Controller
{
    /**
     * Initiate a call to another user
     */
    public function initiate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'target_user_id' => ['required', 'integer', 'exists:users,id'],
            'type' => ['required', 'string', 'in:audio,video'],
            'offer' => ['required', 'array'], // WebRTC offer SDP
        ]);

        $targetUser = User::findOrFail($validated['target_user_id']);

        // Broadcast call event to target user
        broadcast(new \App\Events\CallInitiated([
            'caller_id' => $request->user()->id,
            'caller_name' => $request->user()->name,
            'caller_avatar' => $request->user()->avatar,
            'target_user_id' => $validated['target_user_id'],
            'type' => $validated['type'],
            'offer' => $validated['offer'],
            'timestamp' => now()->toIso8601String(),
        ]))->toOthers();

        return response()->json([
            'message' => 'Call initiated',
            'target_user' => $targetUser,
        ]);
    }

    /**
     * Accept an incoming call
     */
    public function accept(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'caller_id' => ['required', 'integer', 'exists:users,id'],
            'answer' => ['required', 'array'], // WebRTC answer SDP
        ]);

        $caller = User::findOrFail($validated['caller_id']);

        // Broadcast accept event to caller
        broadcast(new \App\Events\CallAccepted([
            'accepter_id' => $request->user()->id,
            'accepter_name' => $request->user()->name,
            'caller_id' => $validated['caller_id'],
            'answer' => $validated['answer'],
            'timestamp' => now()->toIso8601String(),
        ]))->toOthers();

        return response()->json([
            'message' => 'Call accepted',
        ]);
    }

    /**
     * Reject an incoming call
     */
    public function reject(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'caller_id' => ['required', 'integer', 'exists:users,id'],
            'reason' => ['sometimes', 'string'],
        ]);

        $caller = User::findOrFail($validated['caller_id']);

        // Broadcast reject event to caller
        broadcast(new \App\Events\CallRejected([
            'rejecter_id' => $request->user()->id,
            'caller_id' => $validated['caller_id'],
            'reason' => $validated['reason'] ?? 'busy',
            'timestamp' => now()->toIso8601String(),
        ]))->toOthers();

        return response()->json([
            'message' => 'Call rejected',
        ]);
    }

    /**
     * End an ongoing call
     */
    public function end(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'target_user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $targetUser = User::findOrFail($validated['target_user_id']);

        // Broadcast end call event
        broadcast(new \App\Events\CallEnded([
            'ender_id' => $request->user()->id,
            'target_user_id' => $validated['target_user_id'],
            'timestamp' => now()->toIso8601String(),
        ]))->toOthers();

        return response()->json([
            'message' => 'Call ended',
        ]);
    }

    /**
     * Send ICE candidate during call
     */
    public function iceCandidate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'target_user_id' => ['required', 'integer', 'exists:users,id'],
            'candidate' => ['required', 'array'], // ICE candidate
        ]);

        $targetUser = User::findOrFail($validated['target_user_id']);

        // Broadcast ICE candidate to target user
        broadcast(new \App\Events\IceCandidate([
            'sender_id' => $request->user()->id,
            'target_user_id' => $validated['target_user_id'],
            'candidate' => $validated['candidate'],
            'timestamp' => now()->toIso8601String(),
        ]))->toOthers();

        return response()->json([
            'message' => 'ICE candidate sent',
        ]);
    }
}

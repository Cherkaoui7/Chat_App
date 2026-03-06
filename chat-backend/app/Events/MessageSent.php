<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.' . $this->message->conversation_id),
        ];
    }

    public function broadcastWith(): array
    {
        $this->message->loadMissing('sender:id,name,email,avatar');

        return [
            'message' => [
                'id' => $this->message->id,
                'conversation_id' => $this->message->conversation_id,
                'sender_id' => $this->message->sender_id,
                'message' => $this->message->message,
                'type' => $this->message->type,
                'seen' => (bool) $this->message->seen,
                'file_path' => $this->message->file_path,
                'file_name' => $this->message->file_name,
                'file_mime_type' => $this->message->file_mime_type,
                'file_size' => $this->message->file_size,
                'created_at' => optional($this->message->created_at)->toISOString(),
                'sender' => $this->message->sender ? [
                    'id' => $this->message->sender->id,
                    'name' => $this->message->sender->name,
                    'email' => $this->message->sender->email,
                    'avatar' => $this->message->sender->avatar,
                ] : null,
            ],
        ];
    }

    public function broadcastAs(): string
    {
        return 'MessageSent';
    }
}

<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallRejected implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public array $data)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('call.' . $this->data['caller_id']),
        ];
    }

    public function broadcastWith(): array
    {
        return ['call' => $this->data];
    }

    public function broadcastAs(): string
    {
        return 'CallRejected';
    }
}

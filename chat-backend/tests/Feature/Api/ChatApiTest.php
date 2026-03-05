<?php

namespace Tests\Feature\Api;

use App\Events\MessageSent;
use App\Events\UserTyping;
use App\Models\User;
use Illuminate\Support\Facades\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ChatApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_login(): void
    {
        $registerResponse = $this->postJson('/api/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $registerResponse
            ->assertCreated()
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email'],
                'token',
            ]);

        $loginResponse = $this->postJson('/api/login', [
            'email' => 'john@example.com',
            'password' => 'password',
        ]);

        $loginResponse
            ->assertOk()
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email'],
                'token',
            ]);
    }

    public function test_full_chat_flow_for_private_conversation(): void
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();
        Event::fake([MessageSent::class, UserTyping::class]);

        Sanctum::actingAs($sender);

        $conversationResponse = $this->postJson('/api/conversations', [
            'participant_id' => $receiver->id,
        ]);

        $conversationResponse
            ->assertCreated()
            ->assertJsonPath('type', 'private');

        $conversationId = $conversationResponse->json('id');

        $sendMessageResponse = $this->postJson('/api/messages', [
            'conversation_id' => $conversationId,
            'message' => 'Hello from tests',
        ]);

        $sendMessageResponse
            ->assertCreated()
            ->assertJsonPath('conversation_id', $conversationId)
            ->assertJsonPath('message', 'Hello from tests');

        Event::assertDispatched(MessageSent::class);

        $messagesResponse = $this->getJson('/api/messages/'.$conversationId);

        $messagesResponse
            ->assertOk()
            ->assertJsonPath('data.0.message', 'Hello from tests')
            ->assertJsonPath('data.0.sender_id', $sender->id);

        $typingResponse = $this->postJson('/api/conversations/'.$conversationId.'/typing', [
            'is_typing' => true,
        ]);

        $typingResponse
            ->assertOk()
            ->assertJsonPath('status', 'ok');

        Event::assertDispatched(UserTyping::class);
    }

    public function test_messages_endpoint_requires_authentication(): void
    {
        $this->postJson('/api/messages', [
            'conversation_id' => 1,
            'message' => 'Unauthorized',
        ])->assertUnauthorized();
    }
}

<?php

namespace App\Controllers;

use App\Models\ChatModel;
use App\Models\ChatMemberModel;
use App\Models\MessageModel;
use App\Models\MessageReadModel;
use CodeIgniter\RESTful\ResourceController;
use App\Models\ChatInvitationModel;
use App\Models\FollowersModel;
use App\Models\UserModel;
class ChatController extends ResourceController
{
    protected $format = 'json';

    private function archiveMembership(int $chatId, int $userId): void
    {
        $db = \Config\Database::connect();

        $db->table('chat_members')
            ->where('chat_id', $chatId)
            ->where('user_id', $userId)
            ->set([
                'archived' => 1,
                'left_at' => date('Y-m-d H:i:s'),
            ])
            ->update();
    }

    // Functio to restore membership of a user
    private function restoreMembership(int $chatId, int $userId, string $role = 'member'): void
    {
        $db = \Config\Database::connect();

        $existing = $db->table('chat_members')
            ->where('chat_id', $chatId)
            ->where('user_id', $userId)
            ->get()
            ->getRowArray();

        if ($existing) {
            $db->table('chat_members')
                ->where('chat_id', $chatId)
                ->where('user_id', $userId)
                ->set([
                    'archived' => 0,
                    'left_at' => null,
                    'role' => $existing['role'] ?? $role,
                ])
                ->update();

            return;
        }

        $db->table('chat_members')->insert([
            'chat_id' => $chatId,
            'user_id' => $userId,
            'role' => $role,
            'archived' => 0,
            'left_at' => null,
        ]);
    }

    private function assertChatExists(int $chatId): array
    {
        $chatModel = new ChatModel();
        $chat = $chatModel->find($chatId);

        if (!$chat) {
            return [];
        }

        return $chat;
    }

    // GET /chats
    public function index()
    {
        $userId = (int) $this->request->user->id;

        $chatModel = new ChatModel();
        $db = \Config\Database::connect();

        $builder = $db->table('chat_members cm');
        $builder->select('c.*');
        $builder->join('chats c', 'c.id = cm.chat_id');
        $builder->where('cm.user_id', $userId);
        $builder->where('(cm.archived IS NULL OR cm.archived = 0)', null, false);

        $chats = $builder->get()->getResultArray();

        foreach ($chats as &$chat) {
            if ($chat['type'] === 'private' && $chat['visibility'] === 'private') {
                $otherUser = $db->table('chat_members cm')
                    ->select('u.username')
                    ->join('users u', 'u.id = cm.user_id')
                    ->where('cm.chat_id', $chat['id'])
                    ->where('cm.user_id !=', $userId)
                    ->get()
                    ->getRowArray();

                if ($otherUser) {
                    $username = ltrim($otherUser['username'], '@');
                    $chat['name'] = '@' . $username;
                }
            }
        }
        unset($chat);
        // Format chats using model helper
        $formatted = array_map(function ($chat) use ($chatModel) {
            return $chatModel->formatChat($chat);
        }, $chats);

        return $this->respond([
            'status' => true,
            'data' => $formatted
        ]);
    }

    // GET /chats/public
    // Get public groups that the user has not joined yet
    public function publicGroups()
    {
        $userId = (int) $this->request->user->id;
        $search = trim((string) ($this->request->getGet('q') ?? ''));

        $limit = (int) ($this->request->getGet('limit') ?? 20);
        $offset = (int) ($this->request->getGet('offset') ?? 0);

        $chatModel = new ChatModel();
        $groups = $chatModel->getPublicGroupsNotJoinedByUser($userId, $search, $limit, $offset);

        return $this->respond([
            'status' => true,
            'data' => $groups,
        ]);
    }

    public function showInvitationByChat($chatId)
    {
        $userId = (int) $this->request->user->id;
        $model = new ChatInvitationModel();

        $invite = $model
            ->select('chat_invitations.*, chats.name')
            ->join('chats', 'chats.id = chat_invitations.chat_id')
            ->where('chat_id', (int) $chatId)
            ->where('invited_user_id', $userId)
            ->where('status', 'pending')
            ->first();

        return $this->respond([
            'status' => true,
            'data' => $invite
        ]);
    }

    // GET /chats/{id}
    public function show($id = null)
    {
        $userId = (int) $this->request->user->id;
        $chatId = (int) $id;

        $chatMemberModel = new ChatMemberModel();
        $chatModel = new ChatModel();

        $chat = $chatModel->find($chatId);

        if (!$chat) {
            return $this->failNotFound('Chat not found');
        }

        $isMember = $chatMemberModel->isMember($chatId, $userId);
        $role = $isMember ? $chatMemberModel->getRole($chatId, $userId) : null;

        $isPublicGroup = $chat['type'] === 'group' && $chat['visibility'] === 'public';

        if (!$isMember && !$isPublicGroup) {
            return $this->failForbidden('You are not a member of this chat');
        }

        $formatted = $chatModel->formatChat($chat);

        if ($chat['type'] === 'private' && $chat['visibility'] === 'private' && $isMember) {
            $db = \Config\Database::connect();

            $otherUser = $db->table('chat_members cm')
                ->select('u.id, u.name, u.username')
                ->join('users u', 'u.id = cm.user_id')
                ->where('cm.chat_id', $chatId)
                ->where('cm.user_id !=', $userId)
                ->get()
                ->getRowArray();

            if ($otherUser) {
                $formatted['name'] = '@' . ltrim($otherUser['username'], '@');
            }
        }

        return $this->respond([
            'status' => true,
            'data' => [
                ...$formatted,
                'my_role' => $role,
                'is_member' => $isMember,
            ]
        ]);
    }

    // POST /chats (DM creation only)
    // Create or reuse a private chat between two users
        public function create()
    {
        $userId = (int) $this->request->user->id;
        $data = $this->request->getJSON(true) ?? [];

        if (($data['type'] ?? 'private') !== 'private') {
            return $this->failValidationErrors('Use /chats/group to create group chats');
        }

        $chatModel = new ChatModel();
        $memberModel = new ChatMemberModel();

        $chatId = $chatModel->insert([
            'name' => $data['name'] ?? 'New Chat',
            'type' => 'private',
            'visibility' => 'private',
            'created_by' => $userId,
        ]);

        $memberModel->insert([
            'chat_id' => $chatId,
            'user_id' => $userId,
            'role' => 'admin',
            'archived' => 0,
            'left_at' => null,
        ]);

        return $this->respondCreated([
            'status' => true,
            'chat_id' => $chatId
        ]);
    }

    // POST /chats/group
    public function createGroup()
    {
        $userId = (int) $this->request->user->id;
        $data = $this->request->getJSON(true) ?? [];

        $name = trim((string) ($data['name'] ?? ''));
        if ($name === '') {
            return $this->failValidationErrors('Name required');
        }

        $visibility = $data['visibility'] ?? 'public';
        if (!in_array($visibility, ['public', 'private'], true)) {
            return $this->failValidationErrors('visibility must be public or private');
        }

        $chatModel = new ChatModel();
        $memberModel = new ChatMemberModel();

        $chatId = $chatModel->insert([
            'name' => $name,
            'type' => 'group',
            'visibility' => $visibility,
            'created_by' => $userId,
        ]);

        $memberModel->insert([
            'chat_id' => $chatId,
            'user_id' => $userId,
            'role' => 'admin',
            'archived' => 0,
            'left_at' => null,
        ]);

        return $this->respondCreated([
            'status' => true,
            'chat_id' => $chatId,
        ]);
    }

    // POST /chats/private/{userId}
    public function createPrivate($targetUserId)
    {
        $userId = (int) $this->request->user->id;
        $targetUserId = (int) $targetUserId;

        if ($userId === $targetUserId) {
            return $this->failValidationErrors('Cannot chat with yourself');
        }

        $chatModel = new ChatModel();
        $memberModel = new ChatMemberModel();
        $db = \Config\Database::connect();

        $builder = $db->table('chat_members cm1');
        $builder->select('cm1.chat_id');
        $builder->join('chat_members cm2', 'cm1.chat_id = cm2.chat_id');
        $builder->join('chats c', 'c.id = cm1.chat_id');
        $builder->where('cm1.user_id', $userId);
        $builder->where('cm2.user_id', $targetUserId);
        $builder->where('c.type', 'private');
        $builder->where('c.visibility', 'private');

        $existing = $builder->get()->getRowArray();
        // Restore existing membership
        if ($existing) {
            $chatId = (int) $existing['chat_id'];

            $this->restoreMembership($chatId, $userId, 'member');

            return $this->respond([
                'status' => true,
                'chat_id' => $chatId,
                'existing' => true
            ]);
        }

        $chatId = $chatModel->insert([
            'name' => null,
            'type' => 'private',
            'visibility' => 'private',
            'created_by' => $userId,
        ]);

        $memberModel->insertBatch([
            [
                'chat_id' => $chatId,
                'user_id' => $userId,
                'role' => 'member',
                'archived' => 0,
                'left_at' => null,
            ],
            [
                'chat_id' => $chatId,
                'user_id' => $targetUserId,
                'role' => 'member',
                'archived' => 0,
                'left_at' => null,
            ]
        ]);

        return $this->respondCreated([
            'status' => true,
            'chat_id' => $chatId,
            'existing' => false
        ]);
    }

    // POST /chats/{id}/join
    public function join($id = null)
    {
        $userId = (int) $this->request->user->id;
        $chatId = (int) $id;

        $chatModel = new ChatModel();
        $chat = $chatModel->find($chatId);

        if (!$chat) {
            return $this->failNotFound('Chat not found');
        }

        if ($chat['type'] !== 'group') {
            return $this->failForbidden('Only group chats can be joined');
        }

        if ($chat['visibility'] === 'private') {
            return $this->failForbidden('This group is private');
        }

        $db = \Config\Database::connect();

        $existing = $db->table('chat_members')
            ->where('chat_id', $chatId)
            ->where('user_id', $userId)
            ->get()
            ->getRowArray();

        if ($existing) {
            $this->restoreMembership($chatId, $userId, $existing['role'] ?? 'member');

            return $this->respond([
                'status' => true,
                'msg' => 'Already a member'
            ]);
        }

        (new ChatMemberModel())->insert([
            'chat_id' => $chatId,
            'user_id' => $userId,
            'role' => 'member',
            'archived' => 0,
            'left_at' => null,
        ]);

        return $this->respond([
            'status' => true,
            'msg' => 'Joined chat'
        ]);
    }

    // POST /chats/{id}/invite
    public function inviteUser($id = null)
    {
        $inviterId = (int) $this->request->user->id;
        $chatId = (int) $id;
        $data = $this->request->getJSON(true) ?? [];

        $targetUserId = (int) ($data['user_id'] ?? 0);

        if ($targetUserId <= 0) {
            return $this->failValidationErrors('user_id is required');
        }

        if ($targetUserId === $inviterId) {
            return $this->failValidationErrors("You can't invite yourself");
        }

        // chat + role check
        $chatModel = new ChatModel();
        $chat = $chatModel->find($chatId);

        if (!$chat || $chat['type'] !== 'group') {
            return $this->failForbidden('Invalid chat');
        }

        $memberModel = new ChatMemberModel();

        if (!$memberModel->hasRole($chatId, $inviterId, 'admin')) {
            return $this->failForbidden('Only admins can invite users');
        }

        // FOLLOW CHECK (target must follow inviter)
        $followersModel = new FollowersModel();

        $follows = $followersModel
            ->where('follower_id', $targetUserId)
            ->where('followed_id', $inviterId)
            ->first();

        if (!$follows) {
            return $this->failForbidden('User must follow you to be invited');
        }

        // prevent duplicates
        $invitationModel = new ChatInvitationModel();

        $existing = $invitationModel
            ->where([
                'chat_id' => $chatId,
                'invited_user_id' => $targetUserId,
                'status' => 'pending'
            ])
            ->first();

        if ($existing) {
            return $this->respond([
                'status' => true,
                'msg' => 'Invitation already sent'
            ]);
        }

        $invitationModel->insert([
            'chat_id' => $chatId,
            'invited_user_id' => $targetUserId,
            'invited_by' => $inviterId,
            'status' => 'pending',
        ]);

        return $this->respond([
            'status' => true,
            'msg' => 'Invitation sent'
        ]);
    }

    public function acceptInvitation($invitationId)
    {
        $userId = (int) $this->request->user->id;

        $invitationModel = new ChatInvitationModel();
        $inv = $invitationModel->find($invitationId);

        // Validation: Does the invite exist and belong to the user?
        if (!$inv || (int) $inv['invited_user_id'] !== $userId) {
            return $this->failForbidden('Invalid invitation or access denied.');
        }

        // Validation: Is it still pending?
        if ($inv['status'] !== 'pending') {
            return $this->failValidationErrors('This invitation has already been processed.');
        }

        // Update Invitation Status
        $invitationModel->update($invitationId, [
            'status' => 'accepted',
            'updated_at' => date('Y-m-d H:i:s')
        ]);

        // Add/Restore Member
        // Using your existing private method to handle both new and returning members
        $this->restoreMembership((int) $inv['chat_id'], $userId, 'member');

        return $this->respond([
            'status' => true,
            'msg' => 'Invitation accepted. You are now a member of the group.',
            'chat_id' => (int) $inv['chat_id']
        ]);
    }

    public function rejectInvitation($invitationId)
    {
        $userId = (int) $this->request->user->id;

        $invitationModel = new ChatInvitationModel();
        $inv = $invitationModel->find($invitationId);

        // Validation
        if (!$inv || (int) $inv['invited_user_id'] !== $userId) {
            return $this->failForbidden('Invalid invitation or access denied.');
        }

        if ($inv['status'] !== 'pending') {
            return $this->failValidationErrors('This invitation has already been processed.');
        }

        // Update Status to Rejected
        $invitationModel->update($invitationId, [
            'status' => 'rejected',
            'updated_at' => date('Y-m-d H:i:s')
        ]);

        return $this->respond([
            'status' => true,
            'msg' => 'Invitation declined.'
        ]);
    }

    public function myInvitations()
    {
        $userId = (int) $this->request->user->id;

        $model = new ChatInvitationModel();

        $invites = $model
            ->select('chat_invitations.*, chats.name')
            ->join('chats', 'chats.id = chat_invitations.chat_id')
            ->where('invited_user_id', $userId)
            ->where('status', 'pending')
            ->findAll();

        return $this->respond([
            'status' => true,
            'data' => $invites
        ]);
    }
    // POST /chats/{id}/leave
    public function leave($id = null)
    {
        $userId = (int) $this->request->user->id;
        $chatId = (int) $id;

        $chatModel = new ChatModel();
        $chat = $chatModel->find($chatId);

        if (!$chat) {
            return $this->failNotFound('Chat not found');
        }

        $this->archiveMembership($chatId, $userId);

        return $this->respond([
            'status' => true,
            'msg' => $chat['type'] === 'private' ? 'Private chat archived' : 'Left chat'
        ]);
    }

    // GET /chats/{id}/messages
    public function messages($id = null)
    {
        $userId = (int) $this->request->user->id;

        $memberModel = new ChatMemberModel();

        if (!$memberModel->isMember((int) $id, $userId)) {
            return $this->failForbidden('Not a member of this chat');
        }

        $limit = (int) ($this->request->getGet('limit') ?? 20);
        $beforeId = $this->request->getGet('before_id');

        $messageModel = new MessageModel();
        $readModel = new MessageReadModel();

        $builder = $messageModel
            ->select('messages.id, messages.chat_id, messages.user_id, messages.message AS content, messages.created_at, users.name AS user_name')
            ->join('users', 'users.id = messages.user_id')
            ->where('messages.chat_id', $id);

        if (!empty($beforeId)) {
            $builder->where('messages.id <', (int) $beforeId);
        }

        $messages = $builder
            ->orderBy('messages.id', 'DESC')
            ->findAll($limit);

        return $this->respond([
            'status' => true,
            'data' => [
                'messages' => array_reverse($messages),
                'last_read_message_id' => $readModel->getLastReadMessageId((int) $id, $userId),
            ]
        ]);
    }

    // POST /chats/{id}/read
    public function read($id = null)
    {
        $userId = (int) $this->request->user->id;
        $chatId = (int) $id;
        $data = $this->request->getJSON(true) ?? [];

        $memberModel = new ChatMemberModel();
        if (!$memberModel->isMember($chatId, $userId)) {
            return $this->failForbidden('Not a member of this chat');
        }

        $messageId = (int) ($data['message_id'] ?? 0);
        if ($messageId <= 0) {
            return $this->failValidationErrors('message_id is required');
        }

        $messageModel = new MessageModel();
        $message = $messageModel->where('id', $messageId)
            ->where('chat_id', $chatId)
            ->first();

        if (!$message) {
            return $this->failNotFound('Message not found');
        }

        $readModel = new MessageReadModel();
        $readModel->markMessagesAsReadUpTo($chatId, $userId, $messageId);

        return $this->respond([
            'status' => true,
            'last_read_message_id' => $readModel->getLastReadMessageId($chatId, $userId),
        ]);
    }

    // POST /chats/{id}/message
    public function sendMessage($id = null)
    {
        $userId = (int) $this->request->user->id;

        $memberModel = new ChatMemberModel();
        if (!$memberModel->isMember((int) $id, $userId)) {
            return $this->failForbidden('Not a member');
        }

        $data = $this->request->getJSON(true) ?? [];

        if (empty($data['message'])) {
            return $this->failValidationErrors('Message required');
        }

        $messageModel = new MessageModel();

        $messageModel->insert([
            'chat_id' => (int) $id,
            'user_id' => $userId,
            'message' => $data['message']
        ]);

        return $this->respondCreated([
            'status' => true
        ]);
    }

    // DELETE /chats/{chatId}/messages/{messageId}
    public function deleteMessage($chatId = null, $messageId = null)
    {
        $userId = (int) $this->request->user->id;

        $memberModel = new ChatMemberModel();
        $messageModel = new MessageModel();

        if (!$memberModel->isMember((int) $chatId, $userId)) {
            return $this->failForbidden('Not a member of this chat');
        }

        $message = $messageModel->find((int) $messageId);

        if (!$message || (int) $message['chat_id'] !== (int) $chatId) {
            return $this->failNotFound('Message not found');
        }

        $isOwner = (int) $message['user_id'] === $userId;
        $role = $memberModel->getRole((int) $chatId, $userId);
        $isAdmin = $role === 'admin';

        if (!$isOwner && !$isAdmin) {
            return $this->failForbidden('You cannot delete this message');
        }

        $messageModel->delete((int) $messageId);

        return $this->respond([
            'status' => true,
            'msg' => 'Message deleted'
        ]);
    }
}
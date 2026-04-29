<?php

namespace App\Models;

use CodeIgniter\Model;

class ChatModel extends Model
{
    protected $table = 'chats';
    protected $primaryKey = 'id';
    protected $returnType = 'array';
    protected $allowedFields = [
        'name',
        'type',
        'visibility',
        'created_by'
    ];

    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';

    public function formatChat(array $chat): array
    {
        if (!$chat) {
            return [];
        }

        return [
            'id' => isset($chat['id']) ? (int) $chat['id'] : null,
            'name' => $chat['name'] ?? null,
            'type' => $chat['type'] ?? null,
            'visibility' => $chat['visibility'] ?? null,
            'created_by' => isset($chat['created_by']) ? (int) $chat['created_by'] : null,
            'created_at' => $chat['created_at'] ?? null,
            'updated_at' => $chat['updated_at'] ?? null,
        ];
    }

    public function getFormattedChatById(int $id): array
    {
        $chat = $this->find($id);
        return $this->formatChat($chat ?? []);
    }

    public function getPublicGroupsNotJoinedByUser(int $userId, string $search = '', int $limit = 20, int $offset = 0): array
    {
        $builder = $this->db->table($this->table . ' c');

        $builder->select('c.*');
        $builder->join('chat_members cm', 'cm.chat_id = c.id AND cm.user_id = ' . (int) $userId, 'left', false);
        $builder->where('c.type', 'group');
        $builder->where('c.visibility', 'public');
        $builder->where('(cm.id IS NULL OR cm.archived = 1)', null, false);

        if ($search !== '') {
            $builder->like('c.name', $search);
        }

        $rows = $builder
            ->orderBy('c.created_at', 'DESC')
            ->limit($limit, $offset)
            ->get()
            ->getResultArray();

        return array_map(fn($chat) => $this->formatChat($chat), $rows);
    }

    public function getChatsWithUser(): array
    {
        $builder = $this->db->table($this->table);

        $builder->select('chats.*, users.id as user_id, users.name as user_name, users.username as user_username, users.avatar as user_avatar');
        $builder->join('users', 'users.id = chats.created_by', 'left');

        $results = $builder->get()->getResultArray();

        return array_map(function ($chat) {
            return [
                'id' => (int) $chat['id'],
                'name' => $chat['name'],
                'type' => $chat['type'],
                'visibility' => $chat['visibility'],
                'created_at' => $chat['created_at'],
                'created_by' => [
                    'id' => (int) $chat['user_id'],
                    'name' => $chat['user_name'],
                    'username' => $chat['user_username'],
                    'avatar' => $chat['user_avatar'],
                ],
            ];
        }, $results);
    }
}
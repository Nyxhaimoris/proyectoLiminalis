<?php

namespace App\Models;

use CodeIgniter\Model;

class ChatMemberModel extends Model
{
    protected $table = 'chat_members';
    protected $primaryKey = 'id';

    protected $allowedFields = [
        'chat_id',
        'user_id',
        'role',
        'joined_at',
        'archived',
        'left_at'
    ];

    protected $useTimestamps = false;

    // FORMAT
    public function formatMember(array $member): array
    {
        if (!$member) {
            return [];
        }

        return [
            'id' => isset($member['id']) ? (int) $member['id'] : null,
            'chat_id' => isset($member['chat_id']) ? (int) $member['chat_id'] : null,
            'user_id' => isset($member['user_id']) ? (int) $member['user_id'] : null,
            'role' => $member['role'] ?? null,
            'joined_at' => $member['joined_at'] ?? null,
            'archived' => (bool) ($member['archived'] ?? false),
            'left_at' => $member['left_at'] ?? null,
        ];
    }

    // GET MEMBERS (ONLY ACTIVE)
    public function getMembersByChatId(int $chatId): array
    {
        return $this->where('chat_id', $chatId)
            ->where('(archived IS NULL OR archived = 0)', null, false)
            ->findAll();
    }

    public function getMembersWithUsers(int $chatId): array
    {
        $builder = $this->db->table($this->table);

        $builder->select('
            chat_members.*,
            users.id as user_id,
            users.name,
            users.username,
            users.avatar
        ');

        $builder->join('users', 'users.id = chat_members.user_id', 'left');
        $builder->where('chat_members.chat_id', $chatId);
        $builder->where('(chat_members.archived IS NULL OR chat_members.archived = 0)', null, false);

        $results = $builder->get()->getResultArray();

        return array_map(function ($row) {
            return [
                'id' => (int) $row['id'],
                'chat_id' => (int) $row['chat_id'],
                'role' => $row['role'],
                'joined_at' => $row['joined_at'],
                'user' => [
                    'id' => (int) $row['user_id'],
                    'name' => $row['name'],
                    'username' => $row['username'],
                    'avatar' => $row['avatar'],
                ],
            ];
        }, $results);
    }

    // MEMBERSHIP CHECK (ONLY ACTIVE)
    public function isMember(int $chatId, int $userId): bool
    {
        return $this->where('chat_id', $chatId)
            ->where('user_id', $userId)
            ->where('(archived IS NULL OR archived = 0)', null, false)
            ->first() !== null;
    }

    // ROLE (ONLY ACTIVE)
    public function getRole(int $chatId, int $userId): ?string
    {
        $member = $this->where('chat_id', $chatId)
            ->where('user_id', $userId)
            ->where('(archived IS NULL OR archived = 0)', null, false)
            ->first();

        return $member['role'] ?? null;
    }
    
    // GET MEMBER (INCLUDING ARCHIVED)
    public function getMemberRaw(int $chatId, int $userId): ?array
    {
        return $this->where([
            'chat_id' => $chatId,
            'user_id' => $userId,
        ])->first();
    }

    public function hasRole(int $chatId, int $userId, string $role): bool
    {
        return $this->where('chat_id', $chatId)
            ->where('user_id', $userId)
            ->where('role', $role)
            ->where('(archived IS NULL OR archived = 0)', null, false)
            ->first() !== null;
    }

    // ARCHIVE MEMBER
    public function archive(int $chatId, int $userId): bool
    {
        return $this->where([
            'chat_id' => $chatId,
            'user_id' => $userId
        ])->set([
                    'archived' => 1,
                    'left_at' => date('Y-m-d H:i:s')
                ])->update();
    }

    // RESTORE MEMBER
    public function restore(int $chatId, int $userId): bool
    {
        return $this->where([
            'chat_id' => $chatId,
            'user_id' => $userId
        ])->set([
                    'archived' => 0,
                    'left_at' => null
                ])->update();
    }
}
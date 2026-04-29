<?php

namespace App\Models;

use CodeIgniter\Model;

class MessageReadModel extends Model
{
    protected $table      = 'message_reads';
    protected $primaryKey = 'id';

    protected $allowedFields = [
        'message_id',
        'user_id',
        'read_at',
    ];

    protected $useTimestamps = false;

    public function formatRead(array $read): array
    {
        if (!$read) {
            return [];
        }

        return [
            'id'         => isset($read['id']) ? (int) $read['id'] : null,
            'message_id' => isset($read['message_id']) ? (int) $read['message_id'] : null,
            'user_id'    => isset($read['user_id']) ? (int) $read['user_id'] : null,
            'read_at'    => $read['read_at'] ?? null,
        ];
    }

    public function getReadsByMessage(int $messageId): array
    {
        $results = $this->where('message_id', $messageId)->findAll();
        return array_map([$this, 'formatRead'], $results);
    }

    public function getReadsByUser(int $userId): array
    {
        $results = $this->where('user_id', $userId)->findAll();
        return array_map([$this, 'formatRead'], $results);
    }

    public function markAsRead(int $messageId, int $userId): bool
    {
        return $this->db->query(
            "INSERT IGNORE INTO message_reads (message_id, user_id) VALUES (?, ?)",
            [$messageId, $userId]
        ) !== false;
    }

    /**
     * Mark all messages up to $messageId as read for this user.
     * Excludes the user's own messages.
     */
    public function markMessagesAsReadUpTo(int $chatId, int $userId, int $messageId): bool
    {
        $messages = $this->db->table('messages')
            ->select('id')
            ->where('chat_id', $chatId)
            ->where('id <=', $messageId)
            ->where('deleted_at', null)
            ->where('user_id !=', $userId)
            ->orderBy('id', 'ASC')
            ->get()
            ->getResultArray();

        foreach ($messages as $msg) {
            $this->markAsRead((int) $msg['id'], $userId);
        }

        return true;
    }

    public function getLastReadMessageId(int $chatId, int $userId): ?int
    {
        $row = $this->db->table('message_reads mr')
            ->select('MAX(mr.message_id) AS last_read_message_id')
            ->join('messages m', 'm.id = mr.message_id')
            ->where('m.chat_id', $chatId)
            ->where('mr.user_id', $userId)
            ->get()
            ->getRowArray();

        return !empty($row['last_read_message_id'])
            ? (int) $row['last_read_message_id']
            : null;
    }

    public function getUnreadCount(int $chatId, int $userId): int
    {
        $builder = $this->db->table('messages');

        return $builder
            ->where('messages.chat_id', $chatId)
            ->where('messages.deleted_at', null)
            ->where('messages.user_id !=', $userId)
            ->where(
                'messages.id NOT IN (
                    SELECT message_id FROM message_reads WHERE user_id = ' . $this->db->escape($userId) . '
                )',
                null,
                false
            )
            ->countAllResults();
    }
}
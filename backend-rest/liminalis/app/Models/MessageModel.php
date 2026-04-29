<?php

namespace App\Models;

use CodeIgniter\Model;

class MessageModel extends Model
{
    protected $table      = 'messages';
    protected $primaryKey = 'id';

    // Ensure these fields match your DB columns exactly
    protected $allowedFields = [
        'chat_id',
        'user_id',
        'message',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Timestamps configuration
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    // Soft delete configuration
    protected $useSoftDeletes = true; // Soft delete is when you dont really delete it but put it's deleted_at field a value (the date when it was deleted)
    protected $deletedField   = 'deleted_at';

    /**
     * Formats a single message row into a clean array
     */
    public function formatMessage(array $message): array
    {
        if (empty($message)) {
            return [];
        }

        return [
            'id'         => isset($message['id']) ? (int) $message['id'] : null,
            'chat_id'    => isset($message['chat_id']) ? (int) $message['chat_id'] : null,
            'user_id'    => isset($message['user_id']) ? (int) $message['user_id'] : null,
            'message'    => $message['message'] ?? null,
            'created_at' => $message['created_at'] ?? null,
            'updated_at' => $message['updated_at'] ?? null,
            'deleted_at' => $message['deleted_at'] ?? null,
        ];
    }

    /**
     * Get a single message by ID
     */
    public function getFormattedMessageById(int $id): array
    {
        $message = $this->find($id);
        return $this->formatMessage($message ?? []);
    }

    /**
     * Get messages with related user data
     * This version uses the Model's built-in methods so Soft Deletes are handled automatically
     */
    public function getMessagesWithUser(int $chatId, int $limit = 50, int $offset = 0): array
    {
        // Use $this->select() instead of $this->db->table() 
        // so that the 'deleted_at IS NULL' check is applied automatically.
        $results = $this->select('messages.*, users.name as user_name, users.username as user_username, users.avatar as user_avatar')
            ->join('users', 'users.id = messages.user_id', 'left')
            ->where('messages.chat_id', $chatId)
            ->orderBy('messages.created_at', 'ASC')
            ->findAll($limit, $offset);

        return array_map(function ($msg) {
            return [
                'id'         => (int) $msg['id'],
                'chat_id'    => (int) $msg['chat_id'],
                'message'    => $msg['message'],
                'created_at' => $msg['created_at'],
                'user'       => [
                    'id'       => (int) $msg['user_id'],
                    'name'     => $msg['user_name'],
                    'username' => $msg['user_username'],
                    'avatar'   => $msg['user_avatar'],
                ],
            ];
        }, $results);
    }
}
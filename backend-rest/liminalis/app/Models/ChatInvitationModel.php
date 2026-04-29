<?php

namespace App\Models;

use CodeIgniter\Model;

class ChatInvitationModel extends Model
{
    protected $table      = 'chat_invitations';
    protected $primaryKey = 'id';

    protected $allowedFields = [
        'chat_id',
        'invited_user_id',
        'invited_by',
        'status',
        'created_at',
        'updated_at', 
    ];

    // Enable automated timestamps for record tracking
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $returnType    = 'array';

    /**
     * Formats an invitation array for JSON responses.
     * Ensures types are cast correctly for the frontend.
     */
    public function formatInvitation(array $invitation): array
    {
        if (empty($invitation)) {
            return [];
        }

        return [
            'id'              => isset($invitation['id']) ? (int) $invitation['id'] : null,
            'chat_id'         => isset($invitation['chat_id']) ? (int) $invitation['chat_id'] : null,
            'invited_user_id' => isset($invitation['invited_user_id']) ? (int) $invitation['invited_user_id'] : null,
            'invited_by'      => isset($invitation['invited_by']) ? (int) $invitation['invited_by'] : null,
            'status'          => $invitation['status'] ?? 'pending',
            'created_at'      => $invitation['created_at'] ?? null,
            'updated_at'      => $invitation['updated_at'] ?? null,
        ];
    }

    /**
     * Get a single invitation by ID with proper formatting.
     */
    public function getFormattedInvitationById(int $id): array
    {
        $invitation = $this->find($id);
        return $this->formatInvitation($invitation ?? []);
    }

    /**
     * Get all pending invitations for a specific user.
     */
    public function getInvitationsByUser(int $userId): array
    {
        $results = $this->where('invited_user_id', $userId)
                        ->orderBy('created_at', 'DESC')
                        ->findAll();

        return array_map([$this, 'formatInvitation'], $results);
    }

    /**
     * Get all invitations (pending, accepted, etc.) for a specific chat group.
     */
    public function getInvitationsByChat(int $chatId): array
    {
        $results = $this->where('chat_id', $chatId)
                        ->orderBy('created_at', 'DESC')
                        ->findAll();

        return array_map([$this, 'formatInvitation'], $results);
    }
}
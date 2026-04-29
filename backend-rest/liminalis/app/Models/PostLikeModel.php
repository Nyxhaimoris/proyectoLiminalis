<?php

namespace App\Models;

use CodeIgniter\Model;

class PostLikeModel extends Model
{
    protected $table = 'post_likes';

    protected $primaryKey = null;
    public $useAutoIncrement = false;

    protected $allowedFields = [
        'post_id',
        'user_id',
        'created_at',
        'updated_at',
    ];

    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';

    public function like(int $postId, int $userId)
    {
        return $this->db->table($this->table)
            ->ignore(true)
            ->insert([
                'post_id' => $postId,
                'user_id' => $userId,
            ]);
    }

    public function unlike(int $postId, int $userId)
    {
        return $this->where([
            'post_id' => $postId,
            'user_id' => $userId,
        ])->delete();
    }

    public function isLiked(int $postId, int $userId): bool
    {
        return $this->db->table($this->table)
            ->where([
                'post_id' => $postId,
                'user_id' => $userId,
            ])
            ->countAllResults() > 0;
    }

    public function countLikes(int $postId): int
    {
        return $this->db->table($this->table)
            ->where('post_id', $postId)
            ->countAllResults();
    }

    public function getLikers(int $postId, int $limit = 50)
    {
        return $this->select('user_id, created_at')
            ->where('post_id', $postId)
            ->orderBy('created_at', 'DESC')
            ->findAll($limit);
    }
}
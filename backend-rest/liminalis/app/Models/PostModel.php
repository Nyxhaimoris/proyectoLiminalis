<?php

namespace App\Models;

use CodeIgniter\Model;

class PostModel extends Model
{
    protected $table = 'posts';
    protected $primaryKey = 'id';

    protected $allowedFields = [
        'user_id',
        'title',
        'slug',
        'excerpt',
        'status',
        'published_at',
    ];

    protected $useTimestamps = true;

    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';

    // Helpers
    public function getBySlug(string $slug)
    {
        return $this->where('slug', $slug)->first();
    }

    public function getUserPosts(int $userId, int $limit = 20, int $offset = 0)
    {
        return $this->where('user_id', $userId)
            ->orderBy('created_at', 'DESC')
            ->findAll($limit, $offset);
    }

    public function publish(int $postId)
    {
        return $this->update($postId, [
            'status' => 'published',
            'published_at' => date('Y-m-d H:i:s')
        ]);
    }
}
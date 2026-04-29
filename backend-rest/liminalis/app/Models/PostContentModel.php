<?php

namespace App\Models;

use CodeIgniter\Model;

class PostContentModel extends Model
{
    protected $table = 'post_content';
    protected $primaryKey = 'id';

    protected $allowedFields = [
        'post_id',
        'content_json',
        'version',
    ];

    protected $useTimestamps = true;

    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';


    // Helpers
    public function getByPostId(int $postId)
    {
        return $this->where('post_id', $postId)->first();
    }

    public function saveContent(int $postId, array $content)
    {
        $existing = $this->where('post_id', $postId)->first();

        if ($existing) {
            return $this->update($existing['id'], [
                'content_json' => json_encode($content),
                'version' => $existing['version'] + 1,
            ]);
        }

        return $this->insert([
            'post_id' => $postId,
            'content_json' => json_encode($content),
            'version' => 1,
        ]);
    }

    public function getDecodedContent(int $postId)
    {
        $row = $this->getByPostId($postId);

        if (!$row) return null;

        return json_decode($row['content_json'], true);
    }
}
<?php

namespace App\Models;

use CodeIgniter\Model;

class PostImageModel extends Model
{
    protected $table = 'post_images';
    protected $primaryKey = 'id';

    protected $allowedFields = [
        'post_id',
        'token',
        'url',
        'mime_type',
        'size',
    ];

    protected $useTimestamps = true;
    protected $createdField = 'created_at';


    // Core operations
    public function addImage(array $data)
    {
        return $this->insert([
            'post_id'   => $data['post_id'],
            'token'     => $data['token'],
            'url'       => $data['url'],
            'mime_type' => $data['mime_type'] ?? null,
            'size'      => $data['size'] ?? null,
        ]);
    }

    public function getByPost(int $postId)
    {
        return $this->where('post_id', $postId)
            ->orderBy('created_at', 'ASC')
            ->findAll();
    }

    public function getByToken(string $token)
    {
        return $this->where('token', $token)->first();
    }

    public function deleteByToken(string $token)
    {
        return $this->where('token', $token)->delete();
    }

    public function deleteByPost(int $postId)
    {
        return $this->where('post_id', $postId)->delete();
    }

    // Utility helpers
    public function attachImagesToDoc(array $doc, array $images)
    {
        $map = [];

        foreach ($images as $img) {
            $map[$img['token']] = $img;
        }

        return [
            'doc' => $doc,
            'images' => $map,
        ];
    }
}
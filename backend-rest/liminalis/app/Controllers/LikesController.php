<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\PostLikeModel;

class LikesController extends ResourceController
{
    protected PostLikeModel $likes;

    public function __construct()
    {
        $this->likes = new PostLikeModel();
    }

    // Function to toggle a like on a post
    public function toggle($postId)
    {
        $userId = $this->request->user->uid ?? null;

        if (!$userId) {
            return $this->failUnauthorized();
        }

        $postId = (int) $postId;
        $userId = (int) $userId;

        $alreadyLiked = $this->likes->isLiked($postId, $userId);

        if ($alreadyLiked) {
            $this->likes->unlike($postId, $userId);
            $liked = false;
        } else {
            $this->likes->like($postId, $userId);
            $liked = true;
        }

        return $this->respond([
            'liked' => $liked,
            'likesCount' => $this->likes->countLikes($postId),
        ]);
    }

    public function status($postId)
    {
        $userId = $this->request->user->uid ?? null;

        return $this->respond([
            'likesCount' => $this->likes->countLikes((int)$postId),
            'liked' => $userId
                ? $this->likes->isLiked((int)$postId, (int)$userId)
                : false,
        ]);
    }
}
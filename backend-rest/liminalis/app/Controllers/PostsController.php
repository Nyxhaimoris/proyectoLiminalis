<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\PostModel;
use App\Models\PostContentModel;
use App\Models\PostImageModel;

class PostsController extends ResourceController
{
    protected $modelName = PostModel::class;
    protected $format = 'json';

    protected PostContentModel $contentModel;
    protected PostImageModel $imageModel;

    public function __construct()
    {
        $this->contentModel = new PostContentModel();
        $this->imageModel = new PostImageModel();
    }

    private function generateSlug(string $title): string
    {
        $slug = strtolower(trim($title));
        $slug = preg_replace('/[^a-z0-9]+/i', '-', $slug);
        $slug = trim($slug, '-');

        return $slug ?: 'post-' . time();
    }

    // CREATE POST
    public function create()
    {
        $data = $this->request->getJSON(true);
        // Validate JSON body
        if (!is_array($data)) {
            return $this->fail('Invalid JSON body', 400);
        }

        $title = trim($data['title'] ?? '');
        $content = $data['content'] ?? null;
        // Validate required fields
        if ($title === '' || empty($content)) {
            return $this->fail('Missing title or content', 422);
        }

        $user = $this->request->user ?? null;
        $userId = $user->uid ?? null;

        if (!$userId) {
            return $this->failUnauthorized('User not authenticated');
        }

        $db = db_connect();
        $db->transBegin();

        try {
            $slug = $this->generateSlug($title);

            $postId = $this->model->insert([
                'user_id' => $userId,
                'title' => $title,
                'slug' => $slug,
                'status' => 'draft',
            ], true);

            if (!$postId) {
                $db->transRollback();
                return $this->failServerError('Could not create post');
            }
            // Saves the structured content
            $saved = $this->contentModel->saveContent($postId, $content);

            if (!$saved) {
                $db->transRollback();
                return $this->failServerError('Could not save post content');
            }

            $db->transCommit();

            return $this->respondCreated([
                'post_id' => $postId,
                'slug' => $slug,
            ]);

        } catch (\Throwable $e) {
            $db->transRollback();
            return $this->failServerError('Unexpected error creating post');
        }
    }

    // GET SINGLE POST
    public function show($id = null)
    {
        $id = (int) $id;

        if ($id <= 0) {
            return $this->fail('Invalid post id', 400);
        }

        $post = $this->model
            ->select('posts.*, users.username, users.avatar, users.slug as user_slug')
            ->join('users', 'users.id = posts.user_id')
            ->find($id);

        if (!$post) {
            return $this->failNotFound('Post not found');
        }

        $content = $this->contentModel->getDecodedContent($id);
        $images = $this->imageModel->getByPost($id);

        return $this->respond([
            'post' => $post,
            'content' => $content,
            'images' => $images,
        ]);
    }

    // UPLOAD IMAGE
    public function uploadImage()
    {
        $file = $this->request->getFile('image');
        $postId = (int) $this->request->getPost('post_id');
        $token = trim((string) $this->request->getPost('token'));
        // Validate required fields
        if ($postId <= 0 || $token === '') {
            return $this->fail('Missing post_id or token', 422);
        }

        if (!$file) {
            return $this->fail('No file received', 422);
        }

        if (!$file->isValid()) {
            return $this->fail('Upload error: ' . $file->getErrorString(), 422);
        }
        // Ensure file is an image
        if (strpos($file->getClientMimeType(), 'image/') !== 0) {
            return $this->fail('File must be an image', 422);
        }

        $uploadDir = FCPATH . 'uploads/posts';

        // Create directory if it doesn't exist
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0775, true);
        }

        $newName = $file->getRandomName();

        try {
            $file->move($uploadDir, $newName);
        } catch (\Throwable $e) {
            return $this->failServerError('Could not move uploaded file');
        }

        $url = 'uploads/posts/' . $newName;
        // Save image metadata in database
        $inserted = $this->imageModel->addImage([
            'post_id' => $postId,
            'token' => $token,
            'url' => $url,
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
        ]);

        if (!$inserted) {
            return $this->failServerError('DB insert failed');
        }

        return $this->respondCreated([
            'token' => $token,
            'url' => $url,
        ]);
    }

    // Returns paginated list of posts with excerpt and preview image
    public function feed()
    {
        $page = (int) ($this->request->getGet('page') ?? 0);
        $limit = (int) ($this->request->getGet('limit') ?? 10);

        $offset = $page * $limit;

        $posts = $this->model
            ->select('id, title, slug, created_at')
            ->orderBy('id', 'DESC')
            ->findAll($limit, $offset);

        if (!$posts) {
            return $this->respond([
                'data' => [],
                'hasMore' => false
            ]);
        }

        $result = [];

        foreach ($posts as $post) {
            // Load content and images
            $content = $this->contentModel->getDecodedContent($post['id']);
            $images = $this->imageModel->getByPost($post['id']);

            $text = '';
            if (is_array($content)) {
                foreach ($content as $block) {
                    if (isset($block['text'])) {
                        $text .= ' ' . $block['text'];
                    }
                }
            }

            $result[] = [
                'id' => $post['id'],
                'title' => $post['title'],
                'slug' => $post['slug'],
                'image' => $images[0]['url'] ?? null,
                'excerpt' => mb_substr(strip_tags($text), 0, 400),
                'created_at' => $post['created_at'],
            ];
        }
        // Total count for pagination
        $total = $this->model->countAllResults();

        return $this->respond([
            'data' => $result,
            'hasMore' => ($offset + $limit) < $total
        ]);
    }

    public function getUserPosts($slug = null)
    {
        if (!$slug) {
            return $this->fail('Missing user slug', 422);
        }

        $userModel = new \App\Models\UserModel();

        $user = $userModel->where('slug', $slug)->first();

        if (!$user) {
            return $this->failNotFound('User not found');
        }

        // pagination
        $page = (int) ($this->request->getGet('page') ?? 0);
        $limit = (int) ($this->request->getGet('limit') ?? 8);
        $offset = $page * $limit;
        // Fetch user posts
        $posts = $this->model
            ->select('id, title, slug, created_at')
            ->where('user_id', $user['id'])
            ->orderBy('id', 'DESC')
            ->findAll($limit, $offset);

        $result = [];

        foreach ($posts as $post) {

            $content = $this->contentModel->getDecodedContent($post['id']);
            $images = $this->imageModel->getByPost($post['id']);

            $text = '';
            // Extract text content for excerpt
            if (is_array($content)) {
                foreach ($content as $block) {
                    if (!empty($block['text'])) {
                        $text .= ' ' . $block['text'];
                    }
                }
            }

            $result[] = [
                'id' => $post['id'],
                'title' => $post['title'],
                'slug' => $post['slug'],
                'image' => $images[0]['url'] ?? null,
                'excerpt' => mb_substr(strip_tags($text), 0, 400),
                'created_at' => $post['created_at'],
            ];
        }

        return $this->respond([
            'user' => $user,
            'posts' => $result
        ]);
    }
}
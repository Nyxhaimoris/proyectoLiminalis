<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\UserModel;
use App\Models\PostModel;

class AdminController extends ResourceController
{
    protected $userModel;
    protected $postModel;

    public function __construct()
    {
        $this->userModel = new UserModel();
        $this->postModel = new PostModel();
    }

    // ---------------- USERS ----------------

    public function listUsers()
    {
        $page = (int) ($this->request->getVar('page') ?? 1);
        $limit = (int) ($this->request->getVar('limit') ?? 10);
        $search = $this->request->getVar('search');

        $offset = ($page - 1) * $limit;

        $builder = $this->userModel->builder();

        if (!empty($search)) {
            $builder->groupStart()
                ->like('username', $search)
                ->orLike('email', $search)
                ->groupEnd();
        }

        $total = $builder->countAllResults(false);

        $users = $builder
            ->limit($limit, $offset)
            ->get()
            ->getResultArray();

        $formattedUsers = array_map(function ($user) {
            return [
                ...$user,
                'role' => $user['type'] == 1 ? 'admin' : 'user'
            ];
        }, $users);

        return $this->respond([
            'status' => 200,
            'data' => $formattedUsers,
            'meta' => [
                'total' => $total,
                'pages' => ceil($total / $limit),
                'page' => $page,
                'limit' => $limit
            ]
        ]);
    }

    public function toggleBan(int $id)
    {
        $user = $this->userModel->find($id);

        if (!$user) {
            return $this->failNotFound('Usuario no encontrado');
        }

        $newStatus = $user['banned'] ? 0 : 1;

        $this->userModel->update($id, [
            'banned' => $newStatus
        ]);

        return $this->respond([
            'message' => $newStatus ? 'Usuario bloqueado' : 'Usuario desbloqueado',
            'banned' => $newStatus
        ]);
    }

    public function promote(int $id)
    {
        $user = $this->userModel->find($id);

        if (!$user) {
            return $this->failNotFound('Usuario no encontrado');
        }

        $newType = $user['type'] == 1 ? 0 : 1;

        $this->userModel->update($id, [
            'type' => $newType
        ]);

        return $this->respond([
            'message' => $newType ? 'Usuario promovido a admin' : 'Usuario degradado a usuario',
            'type' => $newType
        ]);
    }

    // ---------------- POSTS ----------------

    public function listAllPosts()
    {
        $page = (int) ($this->request->getVar('page') ?? 1);
        $limit = (int) ($this->request->getVar('limit') ?? 10);
        $search = $this->request->getVar('search');

        $offset = ($page - 1) * $limit;

        $builder = $this->postModel
            ->select('posts.*, users.username as author_name, post_content.content_json')
            ->join('users', 'users.id = posts.user_id')
            ->join('post_content', 'post_content.post_id = posts.id', 'left');

        if (!empty($search)) {
            $builder->groupStart()
                ->like('posts.title', $search)
                ->orLike('users.username', $search)
                ->orLike('post_content.content_json', $search)
                ->groupEnd();
        }

        $countBuilder = clone $builder;
        $total = $countBuilder->countAllResults(false);

        $posts = $builder
            ->orderBy('posts.created_at', 'DESC')
            ->limit($limit, $offset)
            ->get()
            ->getResultArray();

        return $this->respond([
            'status' => 200,
            'data' => $posts,
            'meta' => [
                'total' => $total,
                'pages' => ceil($total / $limit),
                'page' => $page,
                'limit' => $limit
            ]
        ]);
    }

    public function deletePost(int $id)
    {
        if (!$this->postModel->find($id)) {
            return $this->failNotFound('Post no encontrado');
        }

        $this->postModel->delete($id);

        return $this->respondDeleted([
            'message' => 'Post eliminado por el administrador'
        ]);
    }
}
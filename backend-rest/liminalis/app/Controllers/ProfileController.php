<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Models\FollowersModel;
use App\Models\UserSettingsModel;

class ProfileController extends ResourceController
{
    protected $modelName = 'App\Models\UserModel';
    protected $format = 'json';

    public function getProfile()
    {
        $userData = $this->request->user;
        $user = $this->model->find($userData->uid);

        if (!$user) {
            return $this->failNotFound('Usuario no encontrado');
        }

        unset($user['password']);

        return $this->respond([
            'status' => 200,
            'data' => $user
        ]);
    }

    private function getAuthUserId(): ?int
    {
        $user = $this->request->user ?? null;

        if (!$user)
            return null;

        return (int) (
            $user->uid ??
            $user->id ??
            null
        );
    }

    public function updateProfile()
    {
        $userData = $this->request->user;
        $userId = $userData->uid;

        $updateData = [];

        // Processing of the text fields
        $textFields = ['name', 'username', 'email', 'description'];
        foreach ($textFields as $field) {
            $val = $this->request->getPost($field);
            if ($val !== null) {
                $updateData[$field] = ($field === 'email')
                    ? filter_var($val, FILTER_SANITIZE_EMAIL)
                    : $val;
            }
        }

        // Process Password
        $password = $this->request->getPost('password');
        if (!empty($password)) {
            $updateData['password'] = password_hash($password, PASSWORD_DEFAULT);
        }

        // Process both banner and avatar
        $filesToProcess = [
            'avatar' => 'profiles/',
            'banner' => 'banners/'
        ];

        foreach ($filesToProcess as $inputName => $folder) {
            $file = $this->request->getFile($inputName);

            if ($file && $file->isValid() && !$file->hasMoved()) {

                $uploadPath = FCPATH . $folder;
                if (!is_dir($uploadPath)) {
                    mkdir($uploadPath, 0777, true);
                }

                // delete previous file if existing
                $currentUser = $this->model->find($userId);
                if (!empty($currentUser[$inputName])) {
                    $oldFilePath = FCPATH . $currentUser[$inputName];
                    if (file_exists($oldFilePath) && is_file($oldFilePath)) {
                        unlink($oldFilePath);
                    }
                }

                // Save new image
                $newName = $userId . '_' . $inputName . '_' . time() . '.' . $file->getExtension();
                $file->move($uploadPath, $newName);
                $updateData[$inputName] = $folder . $newName;
            }
        }

        if (empty($updateData)) {
            return $this->fail('No se detectaron cambios para actualizar', 400);
        }

        try {
            if ($this->model->update($userId, $updateData)) {
                $user = $this->model->find($userId);
                unset($user['password']);

                return $this->respond([
                    'status' => 200,
                    'message' => 'Perfil actualizado con éxito',
                    'data' => $user
                ]);
            }

            return $this->fail('No se pudo actualizar el perfil');

        } catch (\Exception $e) {
            return $this->failServerError('Error en BD: ' . $e->getMessage());
        }
    }

    public function getProfileBySlug($slug = null)
    {
        if ($slug === null)
            return $this->fail('Slug no proporcionado', 400);

        // Finding the user by their slug
        $user = $this->model->where('slug', $slug)->first();
        if (!$user)
            return $this->failNotFound('Usuario no encontrado');

        $isFollowing = false;
        $isMe = false;
        $followModel = new \App\Models\FollowersModel();

        // Count using the IDs
        $followersCount = $followModel->where('followed_id', $user['id'])->countAllResults();
        $followingCount = $followModel->where('follower_id', $user['id'])->countAllResults();

        $authHeader = $this->request->getServer('HTTP_AUTHORIZATION');
        if ($authHeader) {
            try {
                $token = str_replace('Bearer ', '', $authHeader);
                $key = getenv('JWT_SECRET');
                $decoded = \Firebase\JWT\JWT::decode($token, new \Firebase\JWT\Key($key, 'HS256'));

                $currentUserId = $decoded->uid; // ID from the token

                $isMe = ($currentUserId == $user['id']);
                $isFollowing = $followModel->where('follower_id', $currentUserId)
                    ->where('followed_id', $user['id'])
                    ->first() ? true : false;
            } catch (\Exception $e) { /* Ignore token errors */
            }
        }

        // Cleaning of sensitive data such as password and email
        unset($user['password'], $user['email']);

        $user['isFollowing'] = $isFollowing;
        $user['isMe'] = $isMe;
        $user['followersCount'] = $followersCount;
        $user['followingCount'] = $followingCount;

        // añadimos si es admin ono
        $user['isAdmin'] = ($user['type'] == 1);

        return $this->respond(['status' => 200, 'data' => $user]);
    }

    /**
     * Seguir/Dejar de seguir
     */
    public function toggleFollow($slug = null)
    {
        if (!$slug)
            return $this->fail('Slug no proporcionado', 400);

        // Obtain ID from the JWT
        $userData = $this->request->user;
        $followerId = $userData->uid;

        // Search the ID of the user we want to follow by their slug
        $targetUser = $this->model->where('slug', $slug)->first();

        if (!$targetUser) {
            return $this->failNotFound('El usuario que intentas seguir no existe');
        }

        $followedId = $targetUser['id'];

        if ($followerId == $followedId) {
            return $this->fail('No puedes seguirte a ti mismo', 400);
        }

        $followModel = new FollowersModel();

        $existing = $followModel->where('follower_id', $followerId)
            ->where('followed_id', $followedId)
            ->first();

        try {
            if ($existing) {
                $followModel->delete($existing['id']);
                return $this->respond([
                    'status' => 200,
                    'message' => 'Dejado de seguir',
                    'isFollowing' => false
                ]);
            } else {
                $followModel->insert([
                    'follower_id' => $followerId,
                    'followed_id' => $followedId
                ]);
                return $this->respond([
                    'status' => 200,
                    'message' => 'Siguiendo',
                    'isFollowing' => true
                ]);
            }
        } catch (\Exception $e) {
            return $this->failServerError('Error al procesar: ' . $e->getMessage());
        }
    }

    /**
     * Search for users
     */
    public function searchUsers()
    {
        $searchTerm = $this->request->getGet('q') ?? '';
        $limit = $this->request->getGet('limit') ?? 20; //  If no limit is stated we use 20 by default
        $offset = $this->request->getGet('offset') ?? 0;

        $query = $this->model->select('id, username, slug, avatar, description');

        if (!empty($searchTerm)) {
            $query->like('username', $searchTerm);
        }

        $users = $query->findAll($limit, $offset);

        return $this->respond([
            'status' => 200,
            'data' => $users,
            'hasMore' => count($users) == $limit
        ]);
    }

    public function getFollowers($slug = null)
    {
        $limit = (int) ($this->request->getVar('limit') ?? 20);
        $offset = (int) ($this->request->getVar('offset') ?? 0);

        $user = $this->model->where('slug', $slug)->first();
        if (!$user)
            return $this->failNotFound('User not found');

        // PRIVACY CHECK
        if (!$this->canViewFollows($user['id'])) {
            return $this->failForbidden('Followers list is private');
        }

        $followModel = new FollowersModel();
        $data = $followModel->select('users.username, users.slug, users.avatar, users.description')
            ->join('users', 'users.id = follows.follower_id')
            ->where('followed_id', $user['id'])
            ->orderBy('follows.id', 'DESC')
            ->limit($limit, $offset)
            ->findAll();

        return $this->respond([
            'status' => 200,
            'data' => $data,
            'hasMore' => count($data) == $limit
        ]);
    }

    public function getFollowing($slug = null)
    {
        $limit = (int) ($this->request->getVar('limit') ?? 20);
        $offset = (int) ($this->request->getVar('offset') ?? 0);

        $user = $this->model->where('slug', $slug)->first();
        if (!$user)
            return $this->failNotFound('User not found');

        // PRIVACY CHECK
        if (!$this->canViewFollows($user['id'])) {
            return $this->failForbidden('Following list is private');
        }

        $followModel = new FollowersModel();
        $data = $followModel->select('users.username, users.slug, users.avatar, users.description')
            ->join('users', 'users.id = follows.followed_id')
            ->where('follower_id', $user['id'])
            ->orderBy('follows.id', 'DESC')
            ->limit($limit, $offset)
            ->findAll();

        return $this->respond([
            'status' => 200,
            'data' => $data,
            'hasMore' => count($data) == $limit
        ]);
    }

    private function canViewFollows($profileUserId)
    {
        $settingsModel = new \App\Models\UserSettingsModel();
        $followModel = new \App\Models\FollowersModel();

        // Get requester ID from the request
        // We check both object and array notation just in case
        $userRequest = $this->request->user ?? null;
        $requestUserId = null;

        if ($userRequest) {
            $requestUserId = is_object($userRequest) ? ($userRequest->uid ?? null) : ($userRequest['uid'] ?? null);
        }

        // OWNER CHECK
        if ($requestUserId !== null && (string) $requestUserId === (string) $profileUserId) {
            return true;
        }

        // Get visibility setting
        $visibilityRow = $settingsModel
            ->where('user_id', $profileUserId)
            ->where('key', 'followers_visibility')
            ->first();

        // Default to public if no setting is found
        $visibility = $visibilityRow['value'] ?? 'public';

        if ($visibility === 'public')
            return true;
        if ($visibility === 'private')
            return false;

        if ($visibility === 'mutual') {
            if (!$requestUserId)
                return false;

            $iFollow = $followModel->where(['follower_id' => $requestUserId, 'followed_id' => $profileUserId])->first();
            $theyFollow = $followModel->where(['follower_id' => $profileUserId, 'followed_id' => $requestUserId])->first();

            return ($iFollow && $theyFollow);
        }

        return true;
    }

    public function searchFollowersForInvite()
    {
        $userId = $this->getAuthUserId();

        if (!$userId) {
            return $this->failUnauthorized('Invalid user token');
        }

        $query = trim((string) ($this->request->getGet('q') ?? ''));
        $limit = (int) ($this->request->getGet('limit') ?? 20);
        $offset = (int) ($this->request->getGet('offset') ?? 0);

        $db = \Config\Database::connect();

        $builder = $db->table('follows f');

        $builder->select('u.id, u.username, u.slug, u.avatar, u.description');
        $builder->join('users u', 'u.id = f.follower_id');

        // users who FOLLOW ME
        $builder->where('f.followed_id', $userId);

        if ($query !== '') {
            $builder->groupStart()
                ->like('u.username', $query)
                ->orLike('u.name', $query)
                ->groupEnd();
        }

        $builder->limit($limit, $offset);

        $data = $builder->get()->getResultArray();

        return $this->respond([
            'status' => true,
            'data' => $data,
            'hasMore' => count($data) === $limit
        ]);
    }
}
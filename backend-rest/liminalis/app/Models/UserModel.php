<?php

namespace App\Models;

use CodeIgniter\Model;

class UserModel extends Model
{
    protected $table      = 'users';
    protected $primaryKey = 'id';

    protected $allowedFields = [
        'name',
        'type',
        'username',
        'slug',
        'email',
        'password',
        'avatar',
        'banner',
        'description',
        'banned',
        'created_at',
        'updated_at',
    ];

    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    /**
     * Normalization of the output data manually
     */
    public function formatUser(array $user): array
    {
        if (!$user) {
            return [];
        }

        return [
            'id'          => isset($user['id']) ? (int) $user['id'] : null,
            'name'        => $user['name'] ?? null,
            'type'        => isset($user['type']) ? (int) $user['type'] : null,
            'username'    => $user['username'] ?? null,
            'slug'        => $user['slug'] ?? null,
            'email'       => $user['email'] ?? null,
            'avatar'      => $user['avatar'] ?? null,
            'banner'      => $user['banner'] ?? null,
            'description' => $user['description'] ?? null,
            'banned'      => isset($user['banned']) ? (bool) $user['banned'] : false,
            'created_at'  => $user['created_at'] ?? null,
            'updated_at'  => $user['updated_at'] ?? null,
        ];
    }

    public function getFormattedUserById(int $id): array
    {
        $user = $this->find($id);
        return $this->formatUser($user ?? []);
    }

    public function getUserForAuth(string $email): ?array
    {
        $user = $this->where('email', $email)->first();

        if (!$user) {
            return null;
        }

        unset($user['password']);

        return $this->formatUser($user);
    }
}
<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use Firebase\JWT\JWT;
use CodeIgniter\I18n\Time;
use App\Models\UserTokensModel;

class LoginController extends ResourceController
{
    protected $modelName = 'App\Models\UserModel';
    protected $format = 'json';

    protected UserTokensModel $tokenModel;

    private string $secret;
    private int $accessTTL;
    private int $refreshTTL;

    public function __construct()
    {
        $this->tokenModel = new UserTokensModel();

        $this->secret      = (string) env('JWT_SECRET');
        $this->accessTTL   = (int) env('JWT_ACCESS_TTL');
        $this->refreshTTL  = (int) env('JWT_REFRESH_TTL');
    }

    private function generateAccessToken(array $user): string
    {
        $payload = [
            'iss'   => base_url(),
            'iat'   => time(),
            'exp'   => time() + $this->accessTTL,
            'uid'   => (int) $user['id'],
            'role'  => (int) $user['type'],
        ];

        return JWT::encode($payload, $this->secret, 'HS256');
    }

    public function login()
    {
        $input = $this->request->getJSON(true);

        if (empty($input['email']) || empty($input['password'])) {
            return $this->fail('Email y password requeridos', 400);
        }

        $user = $this->model->where('email', $input['email'])->first();

        if (!$user || !password_verify($input['password'], $user['password'])) {
            return $this->fail('Credenciales inválidas', 401);
        }

        // Refresh active token 
        $existingToken = $this->tokenModel
            ->where('user_id', $user['id'])
            ->where('revoked', 0)
            ->where('expires_at >', Time::now()->toDateTimeString())
            ->first();

        $refreshToken = $existingToken['refresh_token'] ?? bin2hex(random_bytes(64));

        if (!$existingToken) {
            $this->tokenModel->insert([
                'user_id'        => $user['id'],
                'refresh_token'  => $refreshToken,
                'expires_at'     => Time::now()->addSeconds($this->refreshTTL),
                'revoked'        => 0
            ]);
        }

        return $this->response
            ->setCookie([
                'name'     => 'refresh_token',
                'value'    => $refreshToken,
                'expire'   => $this->refreshTTL,
                'httponly' => true,
                'secure'   => false,
                'samesite' => 'Lax',
                'path'     => '/',
            ])
            ->setJSON([
                'access_token' => $this->generateAccessToken($user)
            ]);
    }

    // Function to refresh access_token 
    public function refresh()
    {
        $refreshToken = $this->request->getCookie('refresh_token');

        if (!$refreshToken) {
            return $this->fail('Refresh token requerido', 400);
        }

        $token = $this->tokenModel
            ->where('refresh_token', $refreshToken)
            ->where('revoked', 0)
            ->where('expires_at >', Time::now()->toDateTimeString())
            ->first();

        if (!$token) {
            return $this->fail('Refresh token inválido o expirado', 401);
        }

        $user = $this->model->find($token['user_id']);

        if (!$user) {
            return $this->fail('Usuario no encontrado', 404);
        }

        if (!empty($user['banned'])) {
            return $this->fail('Usuario bloqueado', 403);
        }

        // Revoke last one
        $this->tokenModel->update($token['id'], [
            'revoked' => 1
        ]);

        $newRefreshToken = bin2hex(random_bytes(64));

        $this->tokenModel->insert([
            'user_id'        => $user['id'],
            'refresh_token'  => $newRefreshToken,
            'expires_at'     => Time::now()->addSeconds($this->refreshTTL),
            'revoked'        => 0
        ]);

        return $this->response
            ->setCookie([
                'name'     => 'refresh_token',
                'value'    => $newRefreshToken,
                'expire'   => $this->refreshTTL,
                'httponly' => true,
                'secure'   => false,
                'samesite' => 'Strict',
                'path'     => '/',
            ])
            ->setJSON([
                'access_token' => $this->generateAccessToken($user)
            ]);
    }

    public function logout()
    {
        $refreshToken = $this->request->getCookie('refresh_token');

        if ($refreshToken) {
            $this->tokenModel
                ->where('refresh_token', $refreshToken)
                ->set(['revoked' => 1]) // Revokes the Refresh Token so is no longer valid
                ->update();
        }

        // Deletes the refresh token
        return $this->response
            ->deleteCookie('refresh_token')
            ->setJSON(['message' => 'Logout correcto']);
    }
}
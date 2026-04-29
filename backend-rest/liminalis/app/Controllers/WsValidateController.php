<?php

namespace App\Controllers;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class WsValidateController extends BaseController
{
    public function wsValidate()
    {
        $authHeader = $this->request->getServer('HTTP_AUTHORIZATION');

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return $this->response->setStatusCode(401)->setJSON(['error' => 'missing token']);
        }

        try {
            $token = $matches[1];
            $secret = env('JWT_SECRET');
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));

            // IMPORTANT: GO SEARCHES FOR UID IN LOWERCASE
            // TODO: ALLOW FOR BOTH LOWER AND UPPERCASE
            return $this->response->setJSON([
                'uid' => (int) ($decoded->uid ?? $decoded->id)
            ]);

        } catch (Exception $e) {
            return $this->response->setStatusCode(401)->setJSON(['error' => 'invalid token']);
        }
    }
}
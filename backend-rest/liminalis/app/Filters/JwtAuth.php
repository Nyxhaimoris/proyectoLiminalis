<?php

namespace App\Filters;

use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Filters\FilterInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Exception;
use App\Models\UserModel;

class JwtAuth implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        // Ignore CORS preflight
        if (strtoupper($request->getMethod()) === 'OPTIONS') {
            return;
        }

        $authHeader = $request->getServer('HTTP_AUTHORIZATION');

        // Check Bearer token exists
        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return service('response')->setStatusCode(401)->setJSON([
                'status'  => 401,
                'error'   => 'Unauthorized',
                'message' => 'Token de acceso requerido'
            ]);
        }

        $token  = $matches[1];
        $secret = env('JWT_SECRET');

        try {
            // Decode JWT
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));

            // Validate issuer
            if ($decoded->iss !== base_url()) {
                throw new Exception('El emisor del token no es válido.');
            }

            // Database Ban & Existence Check
            $userModel = new UserModel();
            $userData = $userModel->find($decoded->uid);

            if (!$userData) {
                return service('response')->setStatusCode(401)->setJSON([
                    'status'  => 401,
                    'error'   => 'Unauthorized',
                    'message' => 'Usuario no encontrado'
                ]);
            }

            if (!empty($userData['banned'])) {
                return service('response')->setStatusCode(403)->setJSON([
                    'status'  => 403,
                    'error'   => 'Forbidden',
                    'message' => 'Usuario bloqueado'
                ]);
            }
            $userObject = (object) $userData;

            if (!isset($userObject->uid) && isset($userObject->id)) {
                $userObject->uid = $userObject->id;
            }

            $request->user = $userObject;

        } catch (ExpiredException $e) {
            return service('response')->setStatusCode(401)->setJSON([
                'status'  => 401,
                'error'   => 'Token Expired',
                'message' => 'El token ha expirado, por favor use el refresh token'
            ]);
        } catch (Exception $e) {
            log_message('error', '[JWT Audit] Error: ' . $e->getMessage());

            return service('response')->setStatusCode(401)->setJSON([
                'status'  => 401,
                'error'   => 'Invalid Token',
                'message' => 'Acceso denegado: Token inválido'
            ]);
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
    }
}
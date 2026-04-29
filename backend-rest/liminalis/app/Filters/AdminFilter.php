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

class AdminFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $user = $request->user ?? null;

        if (!$user || (int) $user->type !== 1) {
            return service('response')->setStatusCode(403)->setJSON([
                'message' => 'Acceso restringido: Se requieren permisos de administrador'
            ]);
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {

    }
}
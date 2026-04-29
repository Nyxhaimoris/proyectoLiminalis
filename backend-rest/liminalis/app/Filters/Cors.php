<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class Cors implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $allowedOrigin = env('CORS_ALLOWED_ORIGIN');

        // Configuramos los headers básicos
        header("Access-Control-Allow-Origin: $allowedOrigin");
        header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-API-KEY, Accept");
        header("Access-Control-Allow-Credentials: true");

        // Si es una petición de preflight, respondemos OK y terminamos
        if (strtoupper($request->getMethod()) === 'OPTIONS') {
            header("HTTP/1.1 200 OK");
            exit();
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Re-aseguramos los headers en la respuesta final que envía CodeIgniter
        $allowedOrigin = env('CORS_ALLOWED_ORIGIN');

        $response->setHeader('Access-Control-Allow-Origin', $allowedOrigin);
        $response->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-API-KEY, Accept');
        $response->setHeader('Access-Control-Allow-Credentials', 'true');

        return $response;
    }
}
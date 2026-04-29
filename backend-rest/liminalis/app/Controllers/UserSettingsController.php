<?php
namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\UserSettingsModel;

class UserSettingsController extends ResourceController
{
    protected $modelName = 'App\Models\UserSettingsModel';
    protected $format = 'json';

    /**
     * GET /settings
     * Returns the settings
     */
    public function index()
    {
        $userData = $this->request->user;

        if (!$userData) {
            return $this->failUnauthorized('Usuario no autenticado');
        }

        try {
            $settings = $this->model
                ->where('user_id', $userData->uid)
                ->findAll();

            $result = [];
            foreach ($settings as $item) {
                $result[$item['key']] = $item['value'];
            }

            return $this->respond([
                'status' => 200,
                'data' => $result
            ]);

        } catch (\Exception $e) {
            return $this->failServerError('Error al obtener configuraciones: ' . $e->getMessage());
        }
    }

    /**
     * POST /settings
     * saves amd or updates a configuration setting
     * Example: { key: "theme", value: "dark" }
     */
    public function save()
    {
        $userData = $this->request->user;

        if (!$userData) {
            return $this->failUnauthorized('Usuario no autenticado');
        }

        $input = $this->request->getJSON(true);

        if (!isset($input['key']) || !isset($input['value'])) {
            return $this->fail('Debe enviar key y value', 400);
        }

        $key = $input['key'];
        $value = $input['value'];

        try {
            // Verificar si ya existe
            $existing = $this->model
                ->where('user_id', $userData->uid)
                ->where('key', $key)
                ->first();

            if ($existing) {
                $this->model->update($existing['id'], ['value' => $value]);
            } else {
                $this->model->insert([
                    'user_id' => $userData->uid,
                    'key' => $key,
                    'value' => $value
                ]);
            }

            return $this->respond([
                'status' => 200,
                'message' => 'Configuración guardada correctamente',
                'data' => [
                    $key => $value
                ]
            ]);

        } catch (\Exception $e) {
            return $this->failServerError('Error al guardar configuración: ' . $e->getMessage());
        }
    }

    public function changePassword()
    {
        $userData = $this->request->user;
        $userId = $userData->uid;

        $userModel = new \App\Models\UserModel();

        $input = $this->request->getJSON(true);

        if (!isset($input['currentPassword']) || !isset($input['newPassword'])) {
            return $this->fail('Datos incompletos', 400);
        }

        $user = $userModel->find($userId);

        if (!$user) {
            return $this->failNotFound('Usuario no encontrado');
        }

        // Verify current password
        if (!password_verify($input['currentPassword'], $user['password'])) {
            return $this->fail('Contraseña actual incorrecta', 401);
        }

        if (strlen($input['newPassword']) < 6) {
            return $this->fail('La contraseña es demasiado corta', 400);
        }

        try {
            $userModel->update($userId, [
                'password' => password_hash($input['newPassword'], PASSWORD_DEFAULT)
            ]);

            return $this->respond([
                'status' => 200,
                'message' => 'Contraseña actualizada correctamente'
            ]);
        } catch (\Exception $e) {
            return $this->failServerError('Error al actualizar contraseña');
        }
    }
}
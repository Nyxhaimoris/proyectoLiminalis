<?php
namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class RegisterController extends ResourceController
{
    protected $modelName = 'App\Models\UserModel';
    protected $format    = 'json';

    public function createUser()
    {
        helper(['url']);
        $input = $this->request->getPost();

        if (!$input) {
            return $this->fail('No se recibieron datos válidos', 400);
        }

        $rules = [
            'name'     => 'required|min_length[3]',
            'username' => 'required|min_length[3]|is_unique[users.username]',
            'email'    => 'required|valid_email|is_unique[users.email]',
            'password' => 'required|min_length[6]'
        ];

        if (!$this->validate($rules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }
        
        $usernameClean = url_title($input['username'], '-', true);         
        $slug = $usernameClean . '-' . bin2hex(random_bytes(2));


        // Iinsert user
        $data = [
            'name'     => $input['name'],
            'type'     => 0,
            'username' => $input['username'],
            'slug'     => $slug,
            'email'    => $input['email'],
            'password' => password_hash($input['password'], PASSWORD_DEFAULT),
            'avatar'   => null
        ];

        try {
            $userId = $this->model->insert($data);

            // Manage the avatar file if existing
            $file = $this->request->getFile('avatar');

            if ($file && $file->isValid() && !$file->hasMoved()) {

                $extension = $file->getExtension();
                $newName = $userId . '.' . $extension;

                $path = FCPATH . 'profiles/';

                // make folder
                if (!is_dir($path)) {
                    mkdir($path, 0777, true);
                }

                // Delete previous file if existing
                foreach (glob($path . $userId . '.*') as $oldFile) {
                    unlink($oldFile);
                }

                // Move the file
                $file->move($path, $newName, true);

                // Save file path
                $this->model->update($userId, [
                    'avatar' => 'profiles/' . $newName
                ]);
            }

            return $this->respondCreated([
                'status'  => 201,
                'message' => 'Usuario registrado con éxito',
                'user_id' => $userId
            ]);

        } catch (\Exception $e) {
            return $this->failServerError('Error al guardar en la base de datos');
        }
    }
}
<?php

namespace App\Controllers;

use CodeIgniter\Test\CIUnitTestCase;
use CodeIgniter\Test\FeatureTestTrait;
use CodeIgniter\Test\DatabaseTestTrait;
use App\Models\UserModel;
use Config\Services;
use CodeIgniter\Events\Events;

class ProfileControllerTest extends CIUnitTestCase
{
    use FeatureTestTrait, DatabaseTestTrait;

    protected $migrate   = true;
    protected $refresh   = true;
    protected $namespace = 'App';
    
    private $testUserId;
    private $targetUserId;
    private $testUsername;
    private $targetUsername;
    private $targetSlug;

    /**
     * Helper
     */
    private function logToConsole(string $message)
    {
        $date = date('H:i:s');
        fwrite(STDOUT, "\n\e[36m[{$date}]\e[0m {$message}");
    }

    protected function setUp(): void
    {
        parent::setUp();
        
        $userModel = new UserModel();

        // Identificadores únicos para evitar colisiones en la base de datos
        $this->testUsername   = 'user_' . uniqid();
        $this->targetUsername = 'target_' . uniqid();
        $this->targetSlug     = 'slug-' . uniqid();

        // Crear usuario autenticado
        $this->testUserId = $userModel->insert([
            'email'    => 'me' . uniqid() . '@example.com',
            'username' => $this->testUsername,
            'slug'     => 'my-slug-' . uniqid(),
            'password' => password_hash('12345', PASSWORD_DEFAULT),
            'type'     => 0,
            'status'   => 'active',
            'name'     => 'Tester User'
        ]);

        $this->targetUserId = $userModel->insert([
            'email'    => 'target' . uniqid() . '@example.com',
            'username' => $this->targetUsername,
            'slug'     => $this->targetSlug,
            'password' => password_hash('12345', PASSWORD_DEFAULT),
            'type'     => 0,
            'status'   => 'active',
            'name'     => 'Target Profile'
        ]);

        $this->logToConsole("SETUP: Usuarios [{$this->testUsername}] y [{$this->targetUsername}] creados.");
    }

    /**
     * Mockear el filtro JWT inyecrando el usuario
     */
    private function injectMockUser($id)
    {
        Events::on('pre_system', function () use ($id) {
            $request = Services::request();
            $mockUser = new \stdClass();
            $mockUser->uid = $id;
            @$request->user = $mockUser;
        });
    }

    /**
     * Test: Private Profile Retrieval
     */
    public function testGetProfile()
    {
        $this->logToConsole("TEST: Obteniendo perfil privado /profile...");
        $this->injectMockUser($this->testUserId);

        $result = $this->get('profile');

        $result->assertStatus(200);
        
        // Decodificar para verificar dentro de la llave del data
        $body = json_decode($result->getJSON(), true);
        $this->assertEquals($this->testUsername, $body['data']['username']);
        
        $this->logToConsole("SUCCESS: Perfil privado recuperado correctamente.");
    }

    /**
     * Test: Public Profile by Slug
     */
    public function testGetProfileBySlug()
    {
        $this->logToConsole("TEST: Obteniendo perfil público /profile/{$this->targetSlug}");
        
        $result = $this->get("profile/" . $this->targetSlug);

        $result->assertStatus(200);
        
        // Verificar que el username del objetivo esté en la data
        $body = json_decode($result->getJSON(), true);
        $this->assertEquals($this->targetUsername, $body['data']['username']);
        
        $this->logToConsole("SUCCESS: Perfil público por slug validado.");
    }

    /**
     * Test: Follow/Unfollow Toggle
     */
    public function testToggleFollow()
    {
        $this->logToConsole("TEST: Alternando seguimiento para {$this->targetSlug}");
        $this->injectMockUser($this->testUserId);

        $url = "profile/toggleFollow/" . $this->targetSlug;
        
        // Seguir
        $result = $this->post($url);
        $result->assertStatus(200);
        $result->assertJSONFragment(['isFollowing' => true]);
        $this->logToConsole("STEP: Usuario seguido.");

        // 2. Dejar de seguir
        $result = $this->post($url);
        $result->assertStatus(200);
        $result->assertJSONFragment(['isFollowing' => false]);
        $this->logToConsole("STEP: Usuario dejado de seguir.");

        $this->logToConsole("SUCCESS: Ciclo Follow/Unfollow verificado.");
    }

    /**
     * Test: User Search
     */
    public function testSearchUsers()
    {
        $this->logToConsole("TEST: Buscando al usuario '{$this->targetUsername}'");
        
        $result = $this->get("profile/searchUsers?q=" . $this->targetUsername);

        $result->assertStatus(200);

        $responseBody = json_decode($result->getJSON(), true);
        $usernamesInResult = array_column($responseBody['data'], 'username');

        $this->assertContains($this->targetUsername, $usernamesInResult);
        $this->assertArrayHasKey('hasMore', $responseBody);
        
        $this->logToConsole("SUCCESS: Resultados de búsqueda validados.");
    }

    protected function tearDown(): void
    {
        $this->logToConsole("TEARDOWN: Limpiando estado del sistema.");
        parent::tearDown();
        Events::removeAllListeners('pre_system');
        Services::reset();
        fwrite(STDOUT, "\n");
    }
}
<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateUserTokensTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'INT',
                'constraint'     => 11,
                'unsigned'       => true,
                'auto_increment' => true,
            ],
            'user_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'refresh_token' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
            ],
            'revoked' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'expires_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);

        $this->forge->addKey('id', true);

        // Index for foreign key lookup
        $this->forge->addKey('user_id');

        // ONLY unique index for refresh_token
        $this->forge->addUniqueKey('refresh_token');

        $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'CASCADE');

        $this->forge->createTable('user_tokens');
    }

    public function down()
    {
        $this->forge->dropTable('user_tokens');
    }
}
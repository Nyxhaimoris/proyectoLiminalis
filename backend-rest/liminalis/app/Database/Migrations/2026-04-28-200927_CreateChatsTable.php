<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateChatsTable extends Migration
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
            'name' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'type' => [
                'type'       => 'ENUM',
                'constraint' => ['private', 'group'],
                'default'    => 'private',
            ],
            'visibility' => [
                'type'       => 'ENUM',
                'constraint' => ['public', 'private'],
                'default'    => 'private',
            ],
            'created_by' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'updated_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addKey('created_by');

        $this->forge->addForeignKey(
            'created_by',
            'users',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->forge->createTable('chats');
    }

    public function down()
    {
        $this->forge->dropTable('chats');
    }
}
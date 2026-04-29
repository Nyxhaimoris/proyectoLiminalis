<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateChatMembersTable extends Migration
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
            'chat_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'user_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'role' => [
                'type'       => 'ENUM',
                'constraint' => ['admin', 'member'],
                'default'    => 'member',
                'null'       => true,
            ],
            'joined_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'archived' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
            ],
            'left_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);

        $this->forge->addKey('id', true);

        // prevent duplicate membership
        $this->forge->addUniqueKey(['chat_id', 'user_id']);

        // indexes
        $this->forge->addKey('chat_id');
        $this->forge->addKey('user_id');
        $this->forge->addKey(['chat_id', 'archived']);

        // foreign keys
        $this->forge->addForeignKey('chat_id', 'chats', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'CASCADE');

        $this->forge->createTable('chat_members');
    }

    public function down()
    {
        $this->forge->dropTable('chat_members');
    }
}
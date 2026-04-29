<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateChatInvitationsTable extends Migration
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
            'invited_user_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'invited_by' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'status' => [
                'type'       => 'ENUM',
                'constraint' => ['pending', 'accepted', 'rejected'],
                'default'    => 'pending',
                'null'       => true,
            ],
            'created_at' => [
                'type' => 'TIMESTAMP',
                'null' => true,
            ],
            'updated_at' => [
                'type' => 'TIMESTAMP',
                'null' => true,
            ],
        ]);

        $this->forge->addKey('id', true);

        // Indexes
        $this->forge->addKey('chat_id');
        $this->forge->addKey('invited_user_id');
        $this->forge->addKey('invited_by');

        // Foreign keys
        $this->forge->addForeignKey('chat_id', 'chats', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('invited_user_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('invited_by', 'users', 'id', 'CASCADE', 'CASCADE');

        $this->forge->createTable('chat_invitations');
    }

    public function down()
    {
        $this->forge->dropTable('chat_invitations');
    }
}
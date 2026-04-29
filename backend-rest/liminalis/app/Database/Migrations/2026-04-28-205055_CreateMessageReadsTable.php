<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateMessageReadsTable extends Migration
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
            'message_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'user_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'read_at' => [
                'type'    => 'TIMESTAMP',
                'null' => true,
            ],
        ]);

        $this->forge->addKey('id', true);

        // Indexes
        $this->forge->addKey('message_id');
        $this->forge->addKey('user_id');
        $this->forge->addKey(['user_id', 'message_id']);

        // Foreign keys
        $this->forge->addForeignKey('message_id', 'messages', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'CASCADE');

        $this->forge->createTable('message_reads');
    }

    public function down()
    {
        $this->forge->dropTable('message_reads');
    }
}
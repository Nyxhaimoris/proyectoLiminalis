<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateFollowsTable extends Migration
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
            'follower_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'followed_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => false,
            ],
        ]);

        $this->forge->addKey('id', true);

        // Prevent duplicate follows (same user following same user twice)
        $this->forge->addUniqueKey(['follower_id', 'followed_id']);

        // Foreign keys
        $this->forge->addForeignKey('follower_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('followed_id', 'users', 'id', 'CASCADE', 'CASCADE');

        $this->forge->createTable('follows');
    }

    public function down()
    {
        $this->forge->dropTable('follows');
    }
}
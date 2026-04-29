<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreatePostLikesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'post_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'user_id' => [
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

        // Composite primary key so we don't use an ID
        $this->forge->addKey(['post_id', 'user_id'], true);

        // Index for faster lookups
        $this->forge->addKey('user_id');

        // Foreign keys
        $this->forge->addForeignKey('post_id', 'posts', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'CASCADE');

        $this->forge->createTable('post_likes');
    }

    public function down()
    {
        $this->forge->dropTable('post_likes');
    }
}
<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreatePostContentTable extends Migration
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
            'post_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'content_json' => [
                'type' => 'LONGTEXT',
            ],
            'version' => [
                'type'       => 'INT',
                'constraint' => 11,
                'default'    => 1,
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

        // Enforce one content row per post
        $this->forge->addUniqueKey('post_id');

        // Foreign key
        $this->forge->addForeignKey('post_id', 'posts', 'id', 'CASCADE', 'CASCADE');

        $this->forge->createTable('post_content');
    }

    public function down()
    {
        $this->forge->dropTable('post_content');
    }
}
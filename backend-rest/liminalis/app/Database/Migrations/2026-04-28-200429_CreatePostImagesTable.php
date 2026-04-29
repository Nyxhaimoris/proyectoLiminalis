<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreatePostImagesTable extends Migration
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
            'token' => [
                'type'       => 'VARCHAR',
                'constraint' => 100,
            ],
            'url' => [
                'type' => 'TEXT',
            ],
            'mime_type' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => true,
            ],
            'size' => [
                'type'       => 'INT',
                'constraint' => 11,
                'null'       => true,
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

        // Primary key
        $this->forge->addKey('id', true);

        // Index for relation lookup
        $this->forge->addKey('post_id');
        $this->forge->addUniqueKey('token');

        // Foreign key
        $this->forge->addForeignKey(
            'post_id',
            'posts',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->forge->createTable('post_images');
    }

    public function down()
    {
        $this->forge->dropTable('post_images');
    }
}
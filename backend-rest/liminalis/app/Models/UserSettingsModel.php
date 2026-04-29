<?php
namespace App\Models;

use CodeIgniter\Model;

class UserSettingsModel extends Model
{
    protected $table = 'user_settings';
    protected $primaryKey = 'id';

    protected $allowedFields = [
        'user_id',
        'key',
        'value'
    ];

    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
}
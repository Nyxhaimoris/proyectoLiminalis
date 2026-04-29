<?php

namespace App\Models;

use CodeIgniter\Model;

class FollowersModel extends Model
{
    protected $table = 'follows';
    protected $primaryKey = 'id';

    protected $allowedFields = [ //TODO: ADD UPDATED_AT COLUMN
        'id',
        'created_at',
        'followed_id',
        'follower_id',
    ];

    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = '';
}
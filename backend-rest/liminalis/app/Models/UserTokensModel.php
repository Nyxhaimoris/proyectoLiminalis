<?php
namespace App\Models;

use CodeIgniter\Model;

class UserTokensModel extends Model
{
    protected $table = 'user_tokens';

    protected $allowedFields = [
        'user_id',
        'refresh_token',
        'expires_at',
        'revoked'
    ];
}
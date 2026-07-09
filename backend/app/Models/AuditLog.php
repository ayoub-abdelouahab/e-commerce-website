<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int|null $user_id
 * @property string $user_name
 * @property string $action
 * @property string $model_type
 * @property string $description
 * @property string|null $ip_address
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static> latest()
 * @method static static create(array $attributes)
 */
class AuditLog extends Model
{
    protected $fillable = [
        'user_id', 'user_name', 'action',
        'model_type', 'description', 'ip_address',
    ];
}

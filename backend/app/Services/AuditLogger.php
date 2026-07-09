<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Request;

class AuditLogger
{
    public static function log(
        ?int   $userId,
        string $userName,
        string $action,
        string $modelType,
        string $description,
    ): AuditLog {
        return AuditLog::create([
            'user_id'     => $userId,
            'user_name'   => $userName,
            'action'      => strtoupper($action),
            'model_type'  => $modelType,
            'description' => $description,
            'ip_address'  => Request::ip(),
        ]);
    }
}

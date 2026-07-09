<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class WAF
{
    private array $sqlPatterns = [
        '/\bUNION\b.*\bSELECT\b/i',
        '/\bSELECT\b.*\bFROM\b/i',
        '/\bINSERT\b.*\bINTO\b/i',
        '/\bDELETE\b.*\bFROM\b/i',
        '/\bDROP\b.*\bTABLE\b/i',
        '/\bUPDATE\b.*\bSET\b/i',
        '/\bEXEC\b|\bEXECUTE\b/i',
        '/\bINFORMATION_SCHEMA\b/i',
        '/\bSYS\.(TABLES|COLUMNS|OBJECTS)\b/i',
    ];

    private array $xssPatterns = [
        '/<script\b[^>]*>.*?<\/script>/is',
        '/<\s*iframe/i',
        '/<\s*object/i',
        '/<\s*embed/i',
        '/eval\s*\(/i',
        '/base64_decode\s*\(/i',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $inputs = $request->all();

        foreach ($inputs as $key => $value) {
            if (!is_string($value)) continue;

            if ($this->matchesPatterns($value, $this->sqlPatterns)) {
                return $this->block($request, 'SQL Injection', $key, $value);
            }

            if ($this->matchesPatterns($value, $this->xssPatterns)) {
                return $this->block($request, 'XSS', $key, $value);
            }
        }

        return $next($request);
    }

    private function matchesPatterns(string $value, array $patterns): bool
    {
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $value)) {
                return true;
            }
        }
        return false;
    }

    private function block(Request $request, string $type, string $field, string $value): Response
    {
        Log::warning("WAF blocked: {$type}", [
            'ip'     => $request->ip(),
            'url'    => $request->fullUrl(),
            'method' => $request->method(),
            'field'  => $field,
        ]);

        return response()->json([
            'message' => 'Request blocked by security policy.',
            'type'    => $type,
        ], 403);
    }
}

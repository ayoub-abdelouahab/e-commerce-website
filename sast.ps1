Write-Host "========================================"
Write-Host "  SAST — Static Application Security Test"
Write-Host "========================================"
Write-Host ""

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$exitCode = 0

# ── 1. Larastan (Laravel backend) ──
Write-Host "─── [1/2] Larastan (Laravel) ───" -ForegroundColor Cyan
Write-Host ""
Set-Location -LiteralPath "$root\backend"
composer phpstan 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Larastan: FAILED (exit $LASTEXITCODE)" -ForegroundColor Red
    $exitCode = 1
} else {
    Write-Host "✅ Larastan: PASSED" -ForegroundColor Green
}
Write-Host ""

# ── 2. ESLint (React frontend) ──
Write-Host "─── [2/2] ESLint Security (React) ───" -ForegroundColor Cyan
Write-Host ""
Set-Location -LiteralPath "$root\frontend"
npm run lint 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ESLint: FAILED (exit $LASTEXITCODE)" -ForegroundColor Red
    $exitCode = 1
} else {
    Write-Host "✅ ESLint: PASSED" -ForegroundColor Green
}
Write-Host ""

# ── Summary ──
Write-Host "========================================" -ForegroundColor Yellow
if ($exitCode -eq 0) {
    Write-Host "  ✅ SAST: ALL CHECKS PASSED" -ForegroundColor Green
} else {
    Write-Host "  ❌ SAST: SOME CHECKS FAILED" -ForegroundColor Red
}
Write-Host "========================================" -ForegroundColor Yellow

Set-Location -LiteralPath $root
exit $exitCode

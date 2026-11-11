# Start both API and Web dev servers for E2E testing
$apiProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "apps/api" -PassThru -WindowStyle Hidden
Write-Host "API server started (PID: $($apiProcess.Id))"
Start-Sleep -Seconds 3

$webProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "apps/web" -PassThru -WindowStyle Hidden
Write-Host "Web server started (PID: $($webProcess.Id))"
Start-Sleep -Seconds 5

Write-Host "Both servers started. Ready for E2E tests."

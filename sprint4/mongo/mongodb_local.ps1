param([ValidateSet('Instalar','Iniciar')][string]$Acao = 'Iniciar')
$ErrorActionPreference = 'Stop'
$installRoot = Join-Path $env:LOCALAPPDATA 'PetTrackMongoDB'
$serverVersion = '8.0.34'
$shellVersion = '2.13.0'
$serverDir = Join-Path $installRoot "mongodb-win32-x86_64-windows-$serverVersion"
$shellDir = Join-Path $installRoot "mongosh-$shellVersion-win32-x64"
if ($Acao -eq 'Instalar') {
    New-Item -ItemType Directory -Force -Path $installRoot | Out-Null
    $packages = @(
        @{ Url="https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-$serverVersion.zip"; Dir=$serverDir; Name='mongodb.zip'; Sha='6b021a0864494e4decf278b36477a29eb36072432773e4e62c2f42c302630db0' },
        @{ Url="https://github.com/mongodb-js/mongosh/releases/download/v$shellVersion/mongosh-$shellVersion-win32-x64.zip"; Dir=$shellDir; Name='mongosh.zip'; Sha='7424ffc141513133e3568015a3efc2c41dfdba909a3ef1945891da9a51aa77fa' }
    )
    foreach ($package in $packages) {
        $archive = Join-Path $installRoot $package.Name
        if (-not (Test-Path -LiteralPath $archive)) { Invoke-WebRequest -Uri $package.Url -OutFile $archive }
        if ((Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash -ne $package.Sha) {
            throw "Checksum SHA256 invalido: $($package.Name)."
        }
        if (-not (Test-Path -LiteralPath $package.Dir)) {
            Expand-Archive -LiteralPath $archive -DestinationPath $installRoot
        }
        Write-Output "$($package.Name): SHA256 oficial verificado."
    }
    Write-Output "MongoDB instalado em $installRoot"
    exit 0
}
$serverExe = Join-Path $serverDir 'bin/mongod.exe'
if (-not (Test-Path -LiteralPath $serverExe)) { throw 'Execute primeiro com -Acao Instalar.' }
$listener = Get-NetTCPConnection -LocalPort 27017 -State Listen -ErrorAction SilentlyContinue
if ($listener) { Write-Output 'A porta 27017 ja esta em uso. Confira a instancia com mongosh.'; exit 0 }
$dataDir = Join-Path $installRoot 'data'
$logPath = Join-Path $installRoot 'mongod.log'
New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
$mongoProcess = Start-Process -FilePath $serverExe -ArgumentList @('--dbpath',('"' + $dataDir + '"'),'--bind_ip','127.0.0.1','--port','27017','--logpath',('"' + $logPath + '"'),'--logappend') -WindowStyle Hidden -PassThru
for ($attempt = 0; $attempt -lt 30; $attempt++) {
    $mongoProcess.Refresh()
    if ($mongoProcess.HasExited) { throw "MongoDB encerrou. Consulte $logPath" }
    $client = New-Object Net.Sockets.TcpClient
    try {
        $client.Connect('127.0.0.1', 27017)
        Write-Output 'MongoDB disponivel em mongodb://127.0.0.1:27017. Dados persistidos em PetTrackMongoDB/data.'
        exit 0
    } catch { Start-Sleep -Milliseconds 500 } finally { $client.Dispose() }
}
throw "MongoDB nao ficou disponivel. Consulte $logPath"

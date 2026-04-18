<#
.SYNOPSIS
  Configura o projeto Vercel oris-cloud-frontend via REST API.

.DESCRIPTION
  1. Atualiza project settings (framework=nextjs, rootDirectory=app-next)
  2. Le .env.production.local e cria/atualiza todas as env vars no Vercel
  3. Triga um redeploy do branch main

.PARAMETER Token
  Access Token do Vercel (gerar em https://vercel.com/account/tokens)

.PARAMETER EnvFile
  Caminho pro arquivo .env.production.local com os valores.
  Default: app-next/.env.production.local

.PARAMETER DryRun
  Se especificado, apenas mostra o que seria feito sem chamar a API.

.EXAMPLE
  # Dry run primeiro pra auditar
  .\scripts\vercel-setup.ps1 -Token "vercel_xxx" -DryRun

  # Execucao real
  .\scripts\vercel-setup.ps1 -Token "vercel_xxx"
#>

param(
  [Parameter(Mandatory = $true)]
  [string]$Token,

  [Parameter(Mandatory = $false)]
  [string]$EnvFile = "app-next/.env.production.local",

  [Parameter(Mandatory = $false)]
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# ============================================================
# CONFIG (hardcoded pra este projeto especifico)
# ============================================================
$ProjectId = "prj_uYjwzVILWzCrtgDqA0yVIXnxV3Np"
$TeamId    = "team_Arz13vqJ72x9LvRmwNzSeH9w"
$ApiBase   = "https://api.vercel.com"

$Headers = @{
  Authorization = "Bearer $Token"
  "Content-Type" = "application/json"
}

# ============================================================
# HELPERS
# ============================================================

function Write-Step {
  param([string]$Msg, [string]$Color = "Cyan")
  Write-Host ""
  Write-Host "=== $Msg ===" -ForegroundColor $Color
}

function New-RandomSecret {
  # Equivalente a openssl rand -base64 32
  $bytes = New-Object byte[] 32
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  return [Convert]::ToBase64String($bytes)
}

function Invoke-VercelApi {
  param(
    [string]$Method,
    [string]$Path,
    [object]$Body = $null
  )
  $uri = "$ApiBase$Path"
  if ($uri -notlike "*teamId=*") {
    $sep = if ($uri -like "*?*") { "&" } else { "?" }
    $uri = "$uri$sep" + "teamId=$TeamId"
  }

  $params = @{
    Method = $Method
    Uri = $uri
    Headers = $Headers
  }
  if ($Body) {
    $params.Body = ($Body | ConvertTo-Json -Compress -Depth 10)
  }

  if ($DryRun) {
    Write-Host "  [DRY RUN] $Method $uri" -ForegroundColor Yellow
    if ($Body) {
      $bodyPreview = ($Body | ConvertTo-Json -Compress -Depth 10)
      if ($bodyPreview.Length -gt 200) { $bodyPreview = $bodyPreview.Substring(0, 200) + "..." }
      Write-Host "  body: $bodyPreview" -ForegroundColor DarkGray
    }
    return $null
  }

  return Invoke-RestMethod @params
}

# ============================================================
# 0. VALIDA TOKEN
# ============================================================

Write-Step "0. Validando token"
try {
  $user = Invoke-RestMethod -Uri "$ApiBase/v2/user" -Headers $Headers -Method GET
  Write-Host "  Autenticado como: $($user.user.email)" -ForegroundColor Green
} catch {
  Write-Host "  ERRO: Token invalido ou expirado" -ForegroundColor Red
  Write-Host "  $_" -ForegroundColor Red
  exit 1
}

# ============================================================
# 1. ATUALIZA PROJECT SETTINGS
# ============================================================

Write-Step "1. Atualizando project settings"

$settings = @{
  framework = "nextjs"
  rootDirectory = "app-next"
  buildCommand = $null       # usar default do Next.js
  installCommand = $null     # usar default (pnpm install)
  outputDirectory = $null    # usar default (.next)
  devCommand = $null         # usar default
  nodeVersion = "24.x"
}

Write-Host "  framework: nextjs"
Write-Host "  rootDirectory: app-next"
Write-Host "  nodeVersion: 24.x"

Invoke-VercelApi -Method "PATCH" -Path "/v9/projects/$ProjectId" -Body $settings | Out-Null
Write-Host "  OK" -ForegroundColor Green

# ============================================================
# 2. LE .env E POPULA ENV VARS
# ============================================================

Write-Step "2. Lendo $EnvFile"

if (-not (Test-Path $EnvFile)) {
  Write-Host "  ERRO: arquivo nao encontrado: $EnvFile" -ForegroundColor Red
  Write-Host "  Copie o template primeiro:" -ForegroundColor Yellow
  Write-Host "    Copy-Item app-next/.env.production.local.template app-next/.env.production.local" -ForegroundColor Yellow
  exit 1
}

$envVars = @{}
Get-Content $EnvFile | ForEach-Object {
  $line = $_.Trim()
  if ($line -match '^([A-Z_][A-Z0-9_]*)=(.*)$') {
    $key = $Matches[1]
    $val = $Matches[2]
    # Remove aspas se tiver envolvido com " ou '
    if ($val -match '^"(.*)"$' -or $val -match "^'(.*)'$") {
      $val = $Matches[1]
    }
    if ($val -ne "") {
      $envVars[$key] = $val
    }
  }
}

Write-Host "  Lidas $($envVars.Count) variaveis com valor nao vazio"

# Gera secrets automaticamente se vazios
if (-not $envVars.ContainsKey("BETTER_AUTH_SECRET")) {
  $envVars["BETTER_AUTH_SECRET"] = New-RandomSecret
  Write-Host "  [auto] BETTER_AUTH_SECRET gerado" -ForegroundColor DarkGray
}
if (-not $envVars.ContainsKey("INTERNAL_WEBHOOK_SECRET")) {
  $envVars["INTERNAL_WEBHOOK_SECRET"] = New-RandomSecret
  Write-Host "  [auto] INTERNAL_WEBHOOK_SECRET gerado" -ForegroundColor DarkGray
}

# ============================================================
# 3. BUSCA ENV VARS EXISTENTES (pra atualizar em vez de duplicar)
# ============================================================

Write-Step "3. Buscando env vars existentes no Vercel"

if ($DryRun) {
  $existingVars = @{}
} else {
  $existing = Invoke-VercelApi -Method "GET" -Path "/v9/projects/$ProjectId/env?decrypt=false"
  $existingVars = @{}
  foreach ($e in $existing.envs) {
    $existingVars[$e.key] = $e.id
  }
  Write-Host "  Encontradas $($existingVars.Count) env vars existentes"
}

# ============================================================
# 4. UPSERT DE CADA ENV VAR
# ============================================================

Write-Step "4. Criando/atualizando env vars"

$created = 0
$updated = 0
$failed = 0

foreach ($key in $envVars.Keys | Sort-Object) {
  $value = $envVars[$key]
  $body = @{
    key = $key
    value = $value
    type = "encrypted"
    target = @("production", "preview", "development")
  }

  try {
    if ($existingVars.ContainsKey($key)) {
      $id = $existingVars[$key]
      Invoke-VercelApi -Method "PATCH" -Path "/v9/projects/$ProjectId/env/$id" -Body $body | Out-Null
      Write-Host "  ~ $key (atualizado)" -ForegroundColor DarkCyan
      $updated++
    } else {
      Invoke-VercelApi -Method "POST" -Path "/v10/projects/$ProjectId/env" -Body $body | Out-Null
      Write-Host "  + $key (criado)" -ForegroundColor Green
      $created++
    }
  } catch {
    Write-Host "  ! $key (erro: $_)" -ForegroundColor Red
    $failed++
  }
}

Write-Host ""
Write-Host "  Resumo: $created criadas, $updated atualizadas, $failed falhas"

# ============================================================
# 5. TRIGA REDEPLOY
# ============================================================

Write-Step "5. Disparando redeploy do branch main"

$deployBody = @{
  name = "oris-cloud-frontend"
  gitSource = @{
    type = "github"
    repo = "oris-cloud-frontend-v2"
    ref = "main"
    org = "Felipealmeidaz"
  }
  target = "production"
}

$deploy = Invoke-VercelApi -Method "POST" -Path "/v13/deployments?forceNew=1" -Body $deployBody
if ($DryRun -or -not $deploy) {
  Write-Host "  [DRY RUN] Deploy nao disparado" -ForegroundColor Yellow
} else {
  Write-Host "  Deploy disparado: $($deploy.id)" -ForegroundColor Green
  Write-Host "  URL: https://$($deploy.url)" -ForegroundColor Cyan
  Write-Host "  Inspector: $($deploy.inspectorUrl)" -ForegroundColor Cyan
}

Write-Step "Concluido" "Green"
Write-Host "Proximo passo: monitorar o build. Cascade pode fazer isso via MCP Vercel."

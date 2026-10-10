<#
    Publish this folder to GitHub Pages.

    Project site (recommended):
        .\deploy.ps1 -User wdnmd6969 -Repo brake-game
        -> https://wdnmd6969.github.io/brake-game/

    User site (one per account):
        .\deploy.ps1 -User wdnmd6969 -Repo wdnmd6969.github.io
        -> https://wdnmd6969.github.io/

    The script only initialises a repo inside this folder, commits the site files
    and pushes them. Nothing outside this folder is touched.
#>
param(
    [Parameter(Mandatory = $true)][string]$User,
    [Parameter(Mandatory = $true)][string]$Repo,
    [string]$Branch = 'main',
    [string]$CommitMessage = 'Add offline copy of the braking challenge game',
    [string]$UserName,
    [string]$UserEmail,
    [string]$Proxy
)

$ErrorActionPreference = 'Stop'
$site = Split-Path -Parent $MyInvocation.MyCommand.Path

# 需要时把 git 走本地代理（例如本机到 github.com 直连被阻断时）
$gitArgs = @()
if ($Proxy) {
    $gitArgs = @('-c', "http.proxy=$Proxy")
    Write-Host "[0/4] using proxy $Proxy for git"
}

Push-Location $site
try {
    if (-not (Test-Path '.git')) {
        git @gitArgs init -b $Branch | Out-Null
        Write-Host "[1/4] git repository initialised in $site"
    } else {
        Write-Host "[1/4] existing git repository found, reusing it"
    }

    if ($UserName) { git config user.name $UserName }
    if ($UserEmail) { git config user.email $UserEmail }

    git @gitArgs add -A
    git @gitArgs diff --cached --quiet
    if ($LASTEXITCODE -ne 0) {
        git @gitArgs commit -m $CommitMessage | Out-Null
        Write-Host "[2/4] committed site files"
    } else {
        Write-Host "[2/4] nothing new to commit"
    }

    $url = "https://github.com/$User/$Repo.git"
    if ((git remote) -contains 'origin') {
        git remote set-url origin $url
    } else {
        git remote add origin $url
    }
    Write-Host "[3/4] pushing to $url ($Branch) ..."
    git @gitArgs push -u origin $Branch
    if ($LASTEXITCODE -ne 0) { throw "git push failed (see the message above)" }

    $lower = $User.ToLower()
    $siteUrl = if ($Repo.ToLower() -eq "$lower.github.io") { "https://$lower.github.io/" } else { "https://$lower.github.io/$Repo/" }

    Write-Host "[4/4] push finished"
    Write-Host ""
    Write-Host "Finished. GitHub Pages rebuilds automatically on every push."
    Write-Host "If Pages is not enabled for this repo yet (only needed once):"
    Write-Host "  1. Open https://github.com/$User/$Repo/settings/pages"
    Write-Host "  2. Source = 'Deploy from a branch'"
    Write-Host "  3. Branch = $Branch , Folder = / (root) , then press Save"
    Write-Host "  4. Wait 1-2 minutes, then open: $siteUrl"
}
finally {
    Pop-Location
}

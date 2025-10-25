$ErrorActionPreference = "Stop"

Write-Host "Checking for existing .git directory..."
if (Test-Path ".git") {
Write-Host "Removing existing .git directory..."
Remove-Item -Recurse -Force ".git"
} else {
Write-Host "No existing .git directory found."
}

Write-Host "Initializing new Git repository..."
git init
git branch -M main

Write-Host "Creating .gitignore..."
@"
node_modules/
.next/
dist/
build/
out/
.turbo/
.vercel/
.env
.env.*
.vscode/
.idea/
"@ | Set-Content -Path ".gitignore" -Encoding UTF8

Write-Host "Adding files to repository..."
git add .

Write-Host "Creating initial commit..."
git commit -m "Initial clean commit (no node_modules)"

Write-Host "Setting remote origin..."
git remote add NewNew "https://github.com/Preetojha08/Celpip_Writing_Practice_Gemini.git"

Write-Host "Pushing to remote main branch..."
git push -u NewNew main --force

Write-Host "Project successfully uploaded to GitHub without large files."
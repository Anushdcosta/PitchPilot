#!/bin/bash

# echo "🧹 Cleaning root node_modules..."
# rm -rf node_modules package-lock.json

# echo "🧹 Cleaning frontend node_modules..."
# rm -rf frontend/node_modules frontend/package-lock.json

echo "📦 Installing backend dependencies..."
npm install

echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "🔐 Creating .env in root..."
echo "GITHUB_TOKEN=Your github token here (instructions in Readme file)" > .env

echo "🌐 Creating frontend/.env..."
echo "VITE_API_BASE=https://${CODESPACE_NAME}-3000.app.github.dev" > frontend/.env
if ! command -v gh &> /dev/null; then
  echo "📦 GitHub CLI not found. Installing from GitHub..."
  type -p curl >/dev/null || sudo apt install curl -y
  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
  sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
  sudo apt update
  sudo apt install gh -y
fi
if [ -n "$CODESPACE_NAME" ]; then
  echo "🌐 Attempting to set ports 3000, 5173, 5001 to public via GitHub CLI..."

  if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found in container."
    echo "⚠️ Please run manually: gh codespace ports visibility -c $CODESPACE_NAME 3000:public 5173:public 5001:public"
  else
    gh codespace ports visibility -c "$CODESPACE_NAME" 3000:public 5173:public 5001:public
    echo "✅ Ports set to public via GitHub CLI."
  fi
else
  echo "⚠️ Not running in a Codespace — skipping port visibility config."
fi

echo "✅ Manual setup complete!"

@echo off
echo ================================
echo 🚀 Starting local setup script...
echo ================================

REM Step 1: Install backend/root dependencies
echo 🧩 Installing root dependencies...
call npm install

REM Step 2: Navigate to frontend folder
cd frontend

REM Step 3: Install frontend dependencies
echo 🎨 Installing frontend dependencies...
call npm install

REM Step 4: Done
echo ✅ Setup complete. You can now run:
echo   - npm run dev 

pause

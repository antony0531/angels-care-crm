@echo off

REM Angels Care CRM - Database Setup Script
REM Run this after configuring your Supabase environment variables

echo 🚀 Angels Care CRM Database Setup
echo ==================================

REM Check if .env.local exists
if not exist ".env.local" (
    echo ❌ Error: .env.local file not found!
    echo Please create .env.local with your Supabase configuration.
    echo See SUPABASE_SETUP.md for details.
    pause
    exit /b 1
)

REM Check if DATABASE_URL is configured
findstr /C:"your_supabase_database_url" .env.local >nul
if %errorlevel% equ 0 (
    echo ❌ Error: DATABASE_URL not configured!
    echo Please update .env.local with your actual Supabase database URL.
    echo See SUPABASE_SETUP.md for details.
    pause
    exit /b 1
)

echo ✅ Environment file found

REM Generate Prisma client
echo 📦 Generating Prisma client...
call npx prisma generate

if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)

echo ✅ Prisma client generated

REM Validate schema
echo 🔍 Validating Prisma schema...
call npx prisma validate

if %errorlevel% neq 0 (
    echo ❌ Schema validation failed
    pause
    exit /b 1
)

echo ✅ Schema is valid

REM Push schema to database
echo 🎯 Pushing schema to Supabase...
call npx prisma db push

if %errorlevel% neq 0 (
    echo ❌ Failed to push schema to database
    echo Please check your DATABASE_URL and Supabase configuration.
    pause
    exit /b 1
)

echo ✅ Database schema deployed successfully!

REM Optional: Seed database
set /p seed_choice="🌱 Would you like to seed the database with sample data? (y/N): "
if /i "%seed_choice%"=="y" (
    echo 🌱 Seeding database...
    call npm run seed
    if %errorlevel% equ 0 (
        echo ✅ Database seeded successfully!
    ) else (
        echo ⚠️  Seeding failed, but database schema is deployed
    )
)

echo.
echo 🎉 Database setup complete!
echo You can now run: npm run dev
echo.
echo Next steps:
echo 1. Test authentication (signup/login)
echo 2. Verify dashboard loads correctly
echo 3. Check database connections in Supabase dashboard
pause
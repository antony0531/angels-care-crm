#!/bin/bash

# Angels Care CRM - Database Setup Script
# Run this after configuring your Supabase environment variables

echo "🚀 Angels Care CRM Database Setup"
echo "=================================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your Supabase configuration."
    echo "See SUPABASE_SETUP.md for details."
    exit 1
fi

# Check if DATABASE_URL is configured
if grep -q "your_supabase_database_url" .env.local; then
    echo "❌ Error: DATABASE_URL not configured!"
    echo "Please update .env.local with your actual Supabase database URL."
    echo "See SUPABASE_SETUP.md for details."
    exit 1
fi

echo "✅ Environment file found"

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "✅ Prisma client generated"

# Validate schema
echo "🔍 Validating Prisma schema..."
npx prisma validate

if [ $? -ne 0 ]; then
    echo "❌ Schema validation failed"
    exit 1
fi

echo "✅ Schema is valid"

# Push schema to database
echo "🎯 Pushing schema to Supabase..."
npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Failed to push schema to database"
    echo "Please check your DATABASE_URL and Supabase configuration."
    exit 1
fi

echo "✅ Database schema deployed successfully!"

# Optional: Seed database
read -p "🌱 Would you like to seed the database with sample data? (y/N): " seed_choice
if [[ $seed_choice == [Yy]* ]]; then
    echo "🌱 Seeding database..."
    npm run seed
    if [ $? -eq 0 ]; then
        echo "✅ Database seeded successfully!"
    else
        echo "⚠️  Seeding failed, but database schema is deployed"
    fi
fi

echo ""
echo "🎉 Database setup complete!"
echo "You can now run: npm run dev"
echo ""
echo "Next steps:"
echo "1. Test authentication (signup/login)"
echo "2. Verify dashboard loads correctly"
echo "3. Check database connections in Supabase dashboard"
#!/bin/bash

echo "🚀 Starting Referral Program Backend..."

# Initialize database (create tables and admin user)
echo "📦 Initializing database..."
python3 init_db.py

# Check if initialization was successful
if [ $? -ne 0 ]; then
    echo "❌ Database initialization failed!"
    exit 1
fi
echo "✅ Database initialized successfully!"

# Seed test data (vendors, clients, referrals) when CREATE_TEST_DATA=true
if [ "${CREATE_TEST_DATA}" = "true" ]; then
    echo "🌱 Seeding test data..."
    python3 create_test_data.py
    if [ $? -ne 0 ]; then
        echo "❌ Test data seeding failed!"
        exit 1
    fi
    echo "✅ Test data seeded successfully!"
else
    echo "ℹ️  Skipping test data (CREATE_TEST_DATA is not true)"
fi

# Start the application with gunicorn
echo "🌐 Starting Gunicorn server..."
exec gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 app:app


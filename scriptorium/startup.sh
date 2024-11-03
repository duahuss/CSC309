#!/bin/bash

# Created with the help of ChatGPT

# Check for Node.js and npm installations
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install it."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install it."
    exit 1
fi

# Load environment variables from .env file if it exists
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Running database migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Create the admin user
echo "Creating admin user..."
ADMIN_USERNAME="admin_user"
ADMIN_PASSWORD="admin_password"

node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createAdmin() {
    const hashedPassword = await bcrypt.hash('$ADMIN_PASSWORD', 10);

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { username: '$ADMIN_USERNAME' },
    });

    if (existingAdmin) {
        console.log('Admin user already exists.');
        return;
    }

    await prisma.user.create({
        data: {
            first_name: 'Admin',
            last_name: 'User',
            username: '$ADMIN_USERNAME',
            email: '$ADMIN_USERNAME@example.com',
            password: hashedPassword,
            phone_number: '123'
        },
    });

    console.log('Admin user created successfully with hashed password.');
}

createAdmin()
    .catch((e) => {
        console.error('Error creating admin user:', e);
        process.exit(1);
    });
"

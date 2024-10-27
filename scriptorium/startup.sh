#!/bin/bash

# Created with the help of Chatgpt

# Checking for some installations
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install it."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install it."
    exit 1
fi

# Install required packages
npm install

# Running database migrations
npx prisma migrate deploy

# Install dependencies if they are not installed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# # Check for required compilers/interpreters
# for cmd in gcc g++ python3; do
#     if ! command -v $cmd &> /dev/null; then
#         echo "$cmd is not installed. Please install it."
#         exit 1
#     fi
# done

# Admin credentials
ADMIN_USERNAME="admin_user"
ADMIN_PASSWORD="admin_password"

node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createAdmin() {
    const hashedPassword = await bcrypt.hash('$ADMIN_PASSWORD', 10);

    await prisma.user.create({
        data: {
            first_name: 'Admin',
            last_name: 'User',
            email: '$ADMIN_USERNAME@example.com',
            password: hashedPassword, 
            role: 'admin',
        },
    });
}

createAdmin()
    .then(() => {
        console.log('Admin user created successfully with hashed password.');
        return prisma.$disconnect();
    })
    .catch((e) => {
        console.error('Error creating admin user:', e);
        process.exit(1);
    });
"

// Error checking generated by ChatGPT

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import bcrypt from 'bcryptjs';
import { generateToken } from '../../../utils/jwt';

export default async function handler(req, res) {
    if (req.method == 'POST') {

    const { first_name, last_name, username, email, password, avatar, phone_number } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const newUser = await prisma.user.create({
            data: {
                first_name,
                last_name,
                username,
                email,
                password: hashedPassword,
                avatar,
                phone_number,
            },
        });
        res.status(201).json({ message: 'User created successfully', user: newUser });
        
    } catch (error) {
        if (error.code === 'P2002') {
          const duplicatedField = error.meta.target[0]; // for checking duplicated field
          res.status(400).json({ error: `${duplicatedField} is already taken` });
        } else {
            res.status(500).json({ error: 'Error creating user' });
          }
        }
      } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
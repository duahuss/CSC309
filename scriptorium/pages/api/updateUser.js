// Developed with ChatGPT

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Use bcryptjs for consistency
import { verifyToken } from '@/utils/jwt';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        const { authorization } = req.headers;

        let userId;
        try {
            if (!authorization) {
                throw new Error('Token is missing');
            }

            const token = authorization.split(" ")[1]; // Extract token from "Bearer <token>" format
            const decodedToken = verifyToken(token); // Verify the token
            if (!decodedToken) {
                throw new Error('Invalid token');
            }

            userId = decodedToken.userId; // Extract userId from decoded token
        } catch (error) {
            console.error('Authorization error:', error.message); // Log specific error message
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { username, phone_number, password, avatar } = req.body;

        try {
            if (username) {
                const existingUser = await prisma.user.findUnique({
                    where: { username },
                });
                if (existingUser && existingUser.id !== userId) {
                    return res.status(409).json({ error: 'Username is already taken' });
                }
            }

            const updateData = {};
            if (username) updateData.username = username;
            if (phone_number) updateData.phone_number = phone_number;
            if (avatar) updateData.avatar = avatar;
            if (password) updateData.password = await bcrypt.hash(password, 10);

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: updateData,
            });

            const responseUser = {
                username: updatedUser.username,
                phone_number: updatedUser.phone_number,
                avatar: updatedUser.avatar
            };

            res.status(200).json({ message: 'User updated successfully', user: responseUser });
        } catch (error) {
            console.error('Update error:', error); // Log the error details
            res.status(500).json({ error: 'Error updating user' });
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

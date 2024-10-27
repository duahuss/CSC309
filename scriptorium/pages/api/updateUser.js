import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { verifyToken } from '@/utils/jwt';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        const { authorization } = req.headers;

        let userId;
        try {
            userId = verifyToken(authorization);
        } catch (error) {
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

            res.status(200).json({ message: 'User updated successfully', user: updatedUser });
        } catch (error) {
            console.error('Update error:', error); // Log the error details
            res.status(500).json({ error: 'Error updating user' });
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

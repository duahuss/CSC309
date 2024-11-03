import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).json({ message: "Token is required" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            await prisma.blacklistedToken.create({
                data: {
                    token,
                    expiresAt: new Date(decoded.exp * 1000),
                },
            });

            res.status(200).json({ message: "Logout successful" });
        } catch (error) {
            return res.status(401).json({ message: "Token is invalid or already expired" });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
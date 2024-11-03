// ChatGPT used for admin non-expiring token 

import jwt from 'jsonwebtoken';

export const generateToken = (userId, isAdmin) => {
    // Set expiration: 1 hour for regular users, no expiration for admin
    const expiresIn = isAdmin ? '100y' : '1h'; // 100 years for admin
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}
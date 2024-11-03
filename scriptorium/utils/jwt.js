import jwt from 'jsonwebtoken';

export function generateToken(userId, isAdmin = false) {
    // Set expiration: 1 hour for regular users, no expiration for admin
    const expiresIn = isAdmin ? '100y' : '1h'; // Example: 100 years for admin
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}
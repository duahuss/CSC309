import jwt from 'jsonwebtoken';

export function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' }); // change ?
}

export function verifyToken(token) {
    try {

        return jwt.verify(token, process.env.JWT_SECRET);

    } catch (error) {

        return null;
        
    }
}

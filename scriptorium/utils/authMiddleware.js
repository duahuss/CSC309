import { verifyToken } from './jwt';

export function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token not provided" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: "Token is invalid" });
    }

    req.userId = decoded.userId;
    next();
}

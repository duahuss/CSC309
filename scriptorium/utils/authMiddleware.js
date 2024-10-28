import { verifyToken } from './jwt';

export function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token not provided" });
    }

    try {
        const decoded = verifyToken(token);
        if (!decoded) {
            throw new Error("Invalid token");
        }
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error("Authentication error:", error.message);
        return res.status(401).json({ message: "Token is invalid" });
    }
}

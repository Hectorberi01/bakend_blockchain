import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

function isUserPayload(obj: any): obj is { email: string; userId: number } {
    return typeof obj === "object" && obj !== null && typeof obj.email === "string" && typeof obj.userId === "number";
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authentication token required" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
        if (!isUserPayload(decoded)) {
            return res.status(401).json({ error: "Invalid token payload" });
        }
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

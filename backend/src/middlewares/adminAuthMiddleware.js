import jwt from "jsonwebtoken";

const adminAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token provided" });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        if (!decodedToken || decodedToken.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized - Invalid admin token" });
        }

        req.adminData = { email: decodedToken.email, role: decodedToken.role };
        next();
    } catch (error) {
        console.error("Admin auth error:", error);
        return res.status(401).json({ message: "Unauthorized - Token verification failed" });
    }
};

export default adminAuthMiddleware;

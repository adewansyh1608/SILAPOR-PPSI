const jwt = require("jsonwebtoken");

class AuthMiddleware {
    constructor() {
        this.verifyToken = this.verifyToken.bind(this);
    }

    /**
     * * @param {Object} req - Objek Request Express.
     * @param {Object} res - Objek Response Express.
     * @param {Function} next - Fungsi next() Express.
     */
    verifyToken(req, res, next) {
        const token = req.cookies.token;

        if (!token) {
            return res.redirect("/login");
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
            
            req.user = decoded; 
            
            next();
        } catch (err) {
            console.error("Invalid token:", err);
            
            res.clearCookie("token");
            return res.redirect("/login");
        }
    }
}

module.exports = new AuthMiddleware();
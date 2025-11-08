const jwt = require('jsonwebtoken');

class ValidTokenMiddleware {
    constructor() {
        this.verifyToken = this.verifyToken.bind(this);
    }

    /**
     * @param {Object} req - Objek Request Express.
     * @param {Object} res - Objek Response Express.
     * @param {Function} next - Fungsi next() Express.
     */
    verifyToken(req, res, next) {
        const token = req.cookies.token;
        
        if (!token) {
            return res.redirect("/"); 
        }
        
        jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, decoded) => {
            if (err) {
                console.error("Token Verification Failed:", err.message);
                res.clearCookie("token"); 
                return res.status(401).json({ 
                    auth: false, 
                    message: 'Gagal untuk melakukan verifikasi token. Silakan login ulang.' 
                });
            }
            
            req.user = decoded; 
            next();
        });
    }
}

const validTokenInstance = new ValidTokenMiddleware();

module.exports = validTokenInstance.verifyToken;
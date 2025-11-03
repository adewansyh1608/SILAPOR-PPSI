// middleware/ValidTokenMiddleware.js

const jwt = require('jsonwebtoken');

class ValidTokenMiddleware {
    constructor() {
        // Binding method agar 'this' selalu merujuk pada instance kelas
        this.verifyToken = this.verifyToken.bind(this);
    }

    /**
     * Middleware untuk memverifikasi JWT dari cookie (menggunakan callback asinkron).
     * @param {Object} req - Objek Request Express.
     * @param {Object} res - Objek Response Express.
     * @param {Function} next - Fungsi next() Express.
     */
    verifyToken(req, res, next) {
        const token = req.cookies.token;
        
        // 1. Cek keberadaan token
        if (!token) {
            // Alihkan ke halaman utama (sesuai kode asli Anda)
            return res.redirect("/"); 
        }
        
        // 2. Verifikasi token secara asinkron
        jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, decoded) => {
            if (err) {
                // Jika verifikasi gagal (invalid, kadaluarsa, dll.)
                console.error("Token Verification Failed:", err.message);
                // Menghapus cookie lama agar pengguna bisa login lagi
                res.clearCookie("token"); 
                return res.status(401).json({ 
                    auth: false, 
                    message: 'Gagal untuk melakukan verifikasi token. Silakan login ulang.' 
                });
            }
            
            // 3. Token valid
            req.user = decoded; 
            next();
        });
    }
}

// Buat instance dan ekspor method utama
const validTokenInstance = new ValidTokenMiddleware();

// Ekspor method verifyToken agar route files dapat menggunakannya secara langsung
module.exports = validTokenInstance.verifyToken;
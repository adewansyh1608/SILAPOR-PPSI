// middleware/AuthMiddleware.js

const jwt = require("jsonwebtoken");

class AuthMiddleware {
    constructor() {
        // Binding method agar 'this' selalu merujuk pada instance kelas saat
        // digunakan sebagai middleware Express (req, res, next).
        this.verifyToken = this.verifyToken.bind(this);
    }

    /**
     * Middleware untuk memverifikasi JWT dari cookie.
     * * @param {Object} req - Objek Request Express.
     * @param {Object} res - Objek Response Express.
     * @param {Function} next - Fungsi next() Express.
     */
    verifyToken(req, res, next) {
        // Ambil token dari cookie, sesuai kode sebelumnya
        const token = req.cookies.token;

        if (!token) {
            // Jika tidak ada token, arahkan ke halaman login
            return res.redirect("/login");
        }

        try {
            // Verifikasi token menggunakan secret key dari environment
            const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
            
            // Simpan payload (data user) ke objek request untuk digunakan di controller
            req.user = decoded; 
            
            // Lanjutkan ke handler berikutnya
            next();
        } catch (err) {
            console.error("Invalid token:", err);
            
            // Jika token tidak valid/kadaluarsa, hapus cookie dan arahkan ke login
            res.clearCookie("token");
            return res.redirect("/login");
        }
    }
}

// Ekspor instance tunggal (Singleton) dari middleware
// Kita hanya butuh satu instance untuk seluruh aplikasi.
module.exports = new AuthMiddleware();
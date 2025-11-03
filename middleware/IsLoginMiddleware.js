// middleware/IsLoggedInMiddleware.js

const jwt = require('jsonwebtoken');

class IsLoggedInMiddleware {
    constructor() {
        // Binding method agar 'this' selalu merujuk pada instance kelas
        this.checkAndRedirect = this.checkAndRedirect.bind(this);
    }

    /**
     * Middleware untuk memeriksa apakah pengguna sudah login (memiliki token).
     * Jika sudah login, akan dialihkan ke dashboard yang sesuai.
     * @param {Object} req - Objek Request Express.
     * @param {Object} res - Objek Response Express.
     * @param {Function} next - Fungsi next() Express.
     */
    checkAndRedirect(req, res, next) {
        const token = req.cookies.token;

        // 1. Periksa keberadaan token
        if (token) {
            try {
                // Gunakan jwt.verify secara SINKRON untuk mendapatkan payload segera
                const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);

                // Asumsi: Payload token memiliki field 'role' (misal: decoded.role)
                const userRole = decoded.role; 

                // 2. Jika token valid, lakukan pengalihan berdasarkan peran
                if (userRole === "user") {
                    console.log("Pengguna sudah login (user), dialihkan ke dashboard.");
                    return res.redirect("/mahasiswa/home");
                } 
                if (userRole === "admin") {
                    console.log("Pengguna sudah login (admin), dialihkan ke dashboard.");
                    return res.redirect("/admin/dashboard");
                }

                // Jika ada token tetapi role tidak valid (kasus jarang), lanjutkan saja
                // atau hapus cookie dan lanjutkan ke next()
            } catch (err) {
                // 3. Jika token ada tapi TIDAK VALID (kadaluarsa/diubah)
                console.warn("Token ditemukan tetapi tidak valid/kadaluarsa:", err.message);
                res.clearCookie("token"); // Hapus token rusak
                // JANGAN redirect ke /login, karena kita mau dia coba akses halaman
                // publik (seperti /login) yang akan dilayani oleh next().
            }
        }

        // 4. Jika tidak ada token, atau token invalid dan sudah dihapus,
        // izinkan request untuk memproses halaman publik (misal: /login, /register)
        next();
    }
}

// Ekspor instance agar bisa langsung digunakan di route tanpa inisialisasi
module.exports = new IsLoggedInMiddleware();
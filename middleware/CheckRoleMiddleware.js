class CheckRoleMiddleware {
    constructor() {
        // Binding method utama agar 'this' tetap merujuk pada instance kelas
        this.checkRole = this.checkRole.bind(this);
    }

    /**
     * Mengembalikan middleware function yang memeriksa peran (role) pengguna.
     * Middleware ini menggunakan currying: dipanggil dengan role (e.g., role('admin'))
     * dan mengembalikan function (req, res, next)
     * * @param {string} requiredRole - Peran yang diperlukan ('admin' atau 'user').
     * @returns {Function} Express middleware function (req, res, next).
     */
    checkRole(requiredRole) {
        // Method ini mengembalikan function Express middleware
        return (req, res, next) => {
            // Asumsi: req.user sudah diisi oleh AuthMiddleware sebelumnya
            if (!req.user || !req.user.role) {
                return res.status(403).json({ success: false, message: "Akses ditolak: Tidak ada peran pengguna." });
            }
            
            // Periksa apakah peran pengguna cocok dengan peran yang diperlukan
            if (req.user.role === requiredRole) {
                next(); 
            } else {
                return res.status(403).json({ success: false, message: "Akses ditolak: Anda tidak memiliki izin." });
            }
        };
    }
}

// Ekspor instance tunggal dari kelas
module.exports = new CheckRoleMiddleware();
class CheckRoleMiddleware {
    constructor() {
        this.checkRole = this.checkRole.bind(this);
    }

    /**
     * * @param {string} requiredRole 
     * @returns {Function} 
     */
    checkRole(requiredRole) {
        return (req, res, next) => {
            if (!req.user || !req.user.role) {
                return res.status(403).json({ success: false, message: "Akses ditolak: Tidak ada peran pengguna." });
            }
            
            if (req.user.role === requiredRole) {
                next(); 
            } else {
                return res.status(403).json({ success: false, message: "Akses ditolak: Anda tidak memiliki izin." });
            }
        };
    }
}

module.exports = new CheckRoleMiddleware();
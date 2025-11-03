class VerificationController {
    /**
     * @param {Object} models - Objek yang berisi model Laporan dan User
     */
    constructor(models) {
        this.Laporan = models.Laporan;
        this.User = models.User;

        // Binding semua method
        this.getPendingReports = this.getPendingReports.bind(this);
        this.verifyReport = this.verifyReport.bind(this);
    }

    // --- METODE UTILITY (Private/Helper) ---

    /**
     * Helper untuk memproses persetujuan atau penolakan verifikasi laporan.
     * @param {Object} laporan - Instance model Laporan yang akan diupdate.
     * @param {string} action - 'approve' atau 'reject'.
     * @param {string} [alasan=null] - Alasan penolakan (jika action !== 'approve').
     */
    #setVerificationStatus(laporan, action, alasan = null) {
        if (action === "approve") {
            laporan.status = "On progress";
            laporan.verifikasi_action = "approve";
            laporan.alasan = null; // Menghapus alasan jika disetujui
        } else {
            laporan.status = "Upload verification rejected";
            laporan.verifikasi_action = "denied";
            laporan.alasan = alasan;
        }
    }

    // --- CONTROLLER METHODS (Public) ---

    async getPendingReports(req, res) {
        try {
            // Mengambil semua laporan yang statusnya menunggu verifikasi
            const reports = await this.Laporan.findAll({
                where: { status: "Waiting for upload verification" },
                include: [{ model: this.User }],
                order: [["createdAt", "DESC"]],
            });
            
            // Mengambil data admin yang sedang login
            const user = await this.User.findOne({ where: { email: req.user.email } });

            res.render("admin/verifikasi", { reports, user });
        } catch (err) {
            console.error("Error getPendingReports:", err);
            res.status(500).send("Terjadi kesalahan server saat mengambil data");
        }
    }

    async verifyReport(req, res) {
        try {
            const { id } = req.params;
            const { action, alasan } = req.body; // action: 'approve' atau 'reject'

            const laporan = await this.Laporan.findByPk(id);
            if (!laporan) {
                return res.status(404).send("Laporan tidak ditemukan");
            }
            
            // Gunakan helper untuk mengatur status
            this.#setVerificationStatus(laporan, action, alasan);

            await laporan.save();

            res.redirect("/admin/verifikasi");
        } catch (err) {
            console.error("Error verifyReport:", err);
            res.status(500).send("Terjadi kesalahan server saat verifikasi");
        }
    }
}

module.exports = VerificationController;
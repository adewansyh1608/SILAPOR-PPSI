// controllers/LandingController.js

class LandingController {
    /**
     * @param {Object} models - Objek yang berisi model Laporan dan User
     */
    constructor(models) {
        this.Laporan = models.Laporan;
        this.User = models.User;
        
        // Binding method untuk memastikan 'this' merujuk ke class saat digunakan sebagai route handler
        this.getLandingPage = this.getLandingPage.bind(this);
    }

    // --- METODE UTILITY (Private/Helper) ---

    async #fetchLatestReports(jenisLaporan) {
        return this.Laporan.findAll({
            where: { jenis_laporan: jenisLaporan },
            include: [{ model: this.User, attributes: ["nama"] }],
            order: [["createdAt", "DESC"]],
            limit: 5,
        });
    }

    async #fetchStatistics() {
        const jumlahLaporanSelesai = await this.Laporan.count({
            where: { status: "Done" },
        });

        const jumlahMahasiswa = await this.User.count({
            where: { role: "mahasiswa" },
        });

        // Data statis atau dari sumber lain (sesuai kode sebelumnya)
        const jumlahUnitTerhubung = 25; 

        return {
            jumlahLaporanSelesai,
            jumlahMahasiswa,
            jumlahUnitTerhubung,
        };
    }

    // --- CONTROLLER METHOD (Public) ---

    async getLandingPage(req, res) {
        try {
            // Mengambil data menggunakan method helper
            const laporanPenemuan = await this.#fetchLatestReports("Penemuan");
            const laporanKehilangan = await this.#fetchLatestReports("Kehilangan");
            
            // Mengambil statistik
            const statistics = await this.#fetchStatistics();

            // Mengambil data user untuk navigasi/display (jika diperlukan)
            // Catatan: req.user mungkin tidak ada di landing page, sesuaikan jika ada middleware
            const user = req.user ? await this.User.findOne({ where: { email: req.user.email } }) : null;


            res.render("landing", {
                title: "Beranda | Sistem Laporan Barang",
                laporanPenemuan,
                laporanKehilangan,
                user, // Kirim data user (bisa null)
                ...statistics, // Menyebar semua statistik
            });
        } catch (error) {
            console.error("Error saat memuat landing page:", error);
            res.status(500).send("Terjadi kesalahan pada server");
        }
    }
}

module.exports = LandingController;
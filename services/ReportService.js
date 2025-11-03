// services/ReportService.js

const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

class ReportService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        this.senderEmail = `"SILAPOR Notification" <${process.env.EMAIL_USER}>`;
    }

    /**
     * Mengirim notifikasi Socket.IO ke semua client.
     * @param {Object} req - Objek Request Express untuk mendapatkan io instance.
     * @param {Object} report - Data laporan baru.
     */
    sendRealtimeNotification(req, report) {
        const io = req.app.get("io");
        if (io) {
            io.emit("report", { message: "Laporan baru telah dibuat", report: report });
        } else {
            console.warn("Socket.IO instance tidak ditemukan di req.app.");
        }
    }

    /**
     * Mengirim email notifikasi laporan baru ke Admin.
     */
    sendNewReportEmail(data) {
        const mailOptions = {
            from: this.senderEmail,
            to: "sisteminformasiunand23@gmail.com", // Email Admin penerima
            subject: "📢 Laporan Baru Diterima",
            html: `
                <h3>Laporan Baru</h3>
                <p>Jenis Laporan: <b>${data.jenis_laporan}</b></p>
                <p>Nama Barang: <b>${data.nama_barang}</b></p>
                <p>Lokasi: ${data.lokasi}</p>
                <p>Tanggal Kejadian: ${data.tanggal_kejadian}</p>
                <p>Deskripsi: ${data.deskripsi}</p>
                <p>Pelapor: ${data.userEmail}</p>
                <hr/>
                <p>Silakan cek dashboard admin untuk verifikasi laporan.</p>
            `,
        };

        this.transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Gagal kirim email:", err);
            } else {
                console.log("Email terkirim:", info.response);
            }
        });
    }

    /**
     * Membersihkan file yang diupload jika proses gagal.
     * @param {Object} req - Objek Request Express yang berisi req.file.
     */
    cleanupUploadedFile(req) {
        if (req.file) {
            const filePath = path.join(req.file.destination || 'uploads', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    }

    /**
     * Menghapus foto barang lama saat proses update.
     * @param {string} filename - Nama file yang akan dihapus.
     */
    deleteOldFile(filename) {
        const filePath = path.join("uploads", filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}

module.exports = ReportService;
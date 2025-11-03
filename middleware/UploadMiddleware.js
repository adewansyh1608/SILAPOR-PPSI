// middleware/UploadMiddleware.js

const multer = require("multer");
const path = require("path");
const fs = require("fs");

class UploadMiddleware {
    constructor() {
        this.uploadDir = path.join(__dirname, "../uploads");
        this.configureDirectory();
        this.multerInstance = this.createMulterInstance();
    }

    /**
     * Memastikan folder 'uploads' ada.
     */
    configureDirectory() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
            console.log(`[Upload] Direktori dibuat: ${this.uploadDir}`);
        }
    }

    /**
     * Membuat konfigurasi disk storage untuk Multer.
     * @returns {multer.StorageEngine}
     */
    createStorageEngine() {
        return multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, this.uploadDir);
            },
            filename: (req, file, cb) => {
                const ext = path.extname(file.originalname).toLowerCase();
                // Walaupun ekstensi dicek di fileFilter, kita cek lagi untuk keamanan nama file
                if (![".jpg", ".jpeg", ".png"].includes(ext)) {
                    return cb(new Error("Format file tidak valid"));
                }
                cb(null, file.fieldname + "-" + Date.now() + ext);
            },
        });
    }

    /**
     * Logika untuk memfilter file.
     * @param {Object} req
     * @param {Object} file
     * @param {Function} cb - Callback function
     */
    fileFilterLogic(req, file, cb) {
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        const ext = path.extname(file.originalname).toLowerCase();
        
        // Cek MIME type dan Ekstensi
        if (!allowedTypes.includes(file.mimetype) || ![".jpg", ".jpeg", ".png"].includes(ext)) {
            return cb(
                new Error("Hanya format JPEG, PNG, dan JPG yang diizinkan"),
                false
            );
        }

        cb(null, true);
    }

    /**
     * Membuat instance Multer dengan semua konfigurasi.
     * @returns {multer.Multer}
     */
    createMulterInstance() {
        const storageEngine = this.createStorageEngine();
        
        return multer({
            storage: storageEngine,
            limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
            fileFilter: this.fileFilterLogic, // Gunakan method sebagai filter
        });
    }

    /**
     * Mengembalikan instance Multer untuk digunakan di route.
     */
    getUploader() {
        return this.multerInstance;
    }
}

// Buat instance tunggal (Singleton)
const uploaderInstance = new UploadMiddleware().getUploader();

// Ekspor instance Multer secara langsung, sesuai ekspektasi route files
module.exports = uploaderInstance;
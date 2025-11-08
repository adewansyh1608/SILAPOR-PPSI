const multer = require("multer");
const path = require("path");
const fs = require("fs");

class UploadMiddleware {
    constructor() {
        this.uploadDir = path.join(__dirname, "../uploads");
        this.configureDirectory();
        this.multerInstance = this.createMulterInstance();
    }

    // Buat folder uploads kalau belum ada
    configureDirectory() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
            console.log(`[Upload] Direktori dibuat: ${this.uploadDir}`);
        }
    }

    // Storage engine untuk multer
    createStorageEngine() {
        return multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, this.uploadDir);
            },
            filename: (req, file, cb) => {
                const ext = path.extname(file.originalname).toLowerCase();
                if (![".jpg", ".jpeg", ".png"].includes(ext)) {
                    return cb(new Error("Format file tidak valid"));
                }
                cb(null, file.fieldname + "-" + Date.now() + ext);
            },
        });
    }

    // Filter file untuk multer
    fileFilterLogic(req, file, cb) {
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        const ext = path.extname(file.originalname).toLowerCase();

        if (!allowedTypes.includes(file.mimetype) || ![".jpg", ".jpeg", ".png"].includes(ext)) {
            return cb(new Error("Hanya format JPEG, PNG, dan JPG yang diizinkan"), false);
        }

        cb(null, true);
    }

    // Buat instance multer
    createMulterInstance() {
        const storageEngine = this.createStorageEngine();
        return multer({
            storage: storageEngine,
            limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
            fileFilter: this.fileFilterLogic,
        });
    }

    // Getter untuk instance multer
    getUploader() {
        return this.multerInstance;
    }
}

// **Ekspor langsung instance multer agar bisa dipakai di route**
const uploaderInstance = new UploadMiddleware().getUploader();
module.exports = uploaderInstance;

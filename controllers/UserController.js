// controllers/UserController.js

const path = require('path');
const fs = require('fs');
const bcrypt = require("bcryptjs");

class UserController {
    /**
     * @param {Object} models - Objek yang berisi model User
     */
    constructor(models) {
        this.User = models.User;

        // Binding semua method
        this.listUsers = this.listUsers.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.showEditForm = this.showEditForm.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.createUser = this.createUser.bind(this);
        this.showAdminProfile = this.showAdminProfile.bind(this);
        this.showAdminEditProfile = this.showAdminEditProfile.bind(this);
        this.updateAdminProfile = this.updateAdminProfile.bind(this);
    }

    // --- METODE UTILITY (Private/Helper) ---

    async #hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    // --- MANAJEMEN USER (CRUD) ---

    async listUsers(req, res) {
        try {
            // Ambil semua user kecuali field password
            const users = await this.User.findAll({ 
                attributes: { exclude: ['password'] },
                order: [['createdAt', 'ASC']],
            });
            // Ambil data admin yang sedang login
            const adminUser = await this.User.findOne({ where: { email: req.user.email } });

            res.render('admin/user', { title: 'Manajemen User', users, user: adminUser });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).render('error', { message: 'Terjadi kesalahan saat memuat daftar user' });
        }
    }

    async deleteUser(req, res) {
        try {
            const userEmail = req.params.email;  
            // Anda bisa tambahkan logika hapus foto profil di sini jika diperlukan
            
            await this.User.destroy({ where: { email: userEmail } });
            res.redirect('/admin/userList');
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).render('error', { message: 'Terjadi kesalahan saat menghapus user' });
        }
    }

    async showEditForm(req, res) {
        try {
            const userEmail = req.params.email;
            const targetUser = await this.User.findOne({
                where: { email: userEmail },
                attributes: { exclude: ['password'] } 
            });

            if (!targetUser) {
                return res.status(404).render('error', { message: 'User tidak ditemukan' });
            }
            
            // Ambil data admin yang sedang login untuk layout
            const adminUser = await this.User.findOne({ where: { email: req.user.email } });

            res.render('admin/editUser', { title: 'Edit User', targetUser, user: adminUser });
        } catch (error) {
            console.error('Error fetching user for edit:', error);
            res.status(500).render('error', { message: 'Terjadi kesalahan saat memuat data user' });
        } 
    }

    async updateUser(req, res) {
        try {
            const userEmail = req.params.email;
            const { nama, email, no_telepon, alamat, role } = req.body;
            
            await this.User.update(
                { nama, email, no_telepon, alamat, role },
                { where: { email: userEmail } }
            );
            res.redirect('/admin/userList');
        }
        catch (error) {
            console.error('Error updating user:', error);
            res.status(500).render('error', { message: 'Terjadi kesalahan saat memperbarui data user' });
        }
    }

    async createUser(req, res) { 
        try {
            const { nama, email, no_telepon, alamat, password, role } = req.body;
            
            // Cek apakah user sudah ada
            const existingUser = await this.User.findOne({ where: { email } });
            if (existingUser) {
                // Tambahkan pesan error yang lebih spesifik jika user sudah ada
                const adminUser = await this.User.findOne({ where: { email: req.user.email } });
                return res.render('admin/user', { 
                    title: 'Manajemen User', 
                    error: 'Email sudah terdaftar.', 
                    users: await this.User.findAll({ attributes: { exclude: ['password'] } }),
                    user: adminUser
                });
            }

            const hashedPassword = await this.#hashPassword(password);
            
            await this.User.create({ 
                nama, email, no_telepon, alamat, 
                password: hashedPassword, 
                role, 
                isVerified: 1 // Otomatis terverifikasi jika dibuat admin
            });
            
            res.redirect('/admin/userList');
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).render('error', { message: 'Terjadi kesalahan saat membuat user baru' });
        }
    }
    
    // --- MANAJEMEN PROFIL ADMIN ---

    async #findAdminUser(req) {
        return this.User.findOne({ where: { email: req.user.email } });
    }

    async #handleProfileUpdate(req, res, userInstance) {
        const { nama, alamat, no_telepon } = req.body;

        // Logika hapus foto lama
        if (req.file) {
            if (userInstance.foto && userInstance.foto !== "default.jpg") {
                const oldPath = path.join(__dirname, "../public/uploads", userInstance.foto);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            userInstance.foto = req.file.filename;
        }

        // Update field
        userInstance.nama = nama || userInstance.nama;
        userInstance.alamat = alamat || userInstance.alamat;
        userInstance.no_telepon = no_telepon || userInstance.no_telepon; 

        await userInstance.save();
        
        return res.redirect("/admin/profile");
    }


    async showAdminProfile(req, res) {
        try {
            const user = await this.#findAdminUser(req);
            if (!user) return res.status(404).send("User tidak ditemukan");

            res.render("admin/profile", { user });
        } catch (err) {
            console.error("Error showAdminProfile:", err);
            res.status(500).send("Gagal mengambil data profil");
        }
    }

    async showAdminEditProfile(req, res) {
        try {
            const user = await this.#findAdminUser(req);
            if (!user) return res.status(404).send("User tidak ditemukan");

            res.render("admin/edit-profile", { user });
        } catch (err) {
            console.error("Error showAdminEditProfile:", err);
            res.status(500).send("Gagal memuat form edit");
        }
    }

    async updateAdminProfile(req, res) {
        try {
            const user = await this.#findAdminUser(req);
            if (!user) return res.status(404).send("User tidak ditemukan");

            return this.#handleProfileUpdate(req, res, user);
        } catch (error) {
            console.error("Error updateAdminProfile:", error);
            return res.status(500).send("Terjadi kesalahan saat update profile");
        }
    }
}

module.exports = UserController;
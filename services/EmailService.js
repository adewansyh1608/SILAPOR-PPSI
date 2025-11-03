const nodemailer = require("nodemailer");
const ejs = require('ejs');
const path = require('path');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        this.senderEmail = `"SILAPOR" <${process.env.EMAIL_USER}>`;
        this.templateDir = path.join(__dirname, '..', 'email'); 
    }

    async sendVerificationEmail(user, token) {
        const verifyLink = `http://localhost:3000/verify-email?token=${token}`;
        const emailTemplatePath = path.join(this.templateDir, 'emailRegis.ejs');

        const emailHtml = await ejs.renderFile(emailTemplatePath, {
            nama: user.nama,
            verifyLink
        });

        await this.transporter.sendMail({
            from: this.senderEmail,
            to: user.email,
            subject: "Verifikasi Email Anda",
            html: emailHtml,
        });
    }

    async sendResetPasswordEmail(user, token) {
        const resetLink = `http://localhost:3000/reset-password?token=${token}`;
        
        const emailHtml = `<h3>Halo ${user.nama}</h3>
                           <p>Klik link berikut untuk reset password akun Anda:</p>
                           <a href="${resetLink}">${resetLink}</a>`;
        
        await this.transporter.sendMail({
            from: this.senderEmail,
            to: user.email,
            subject: "Reset Password SILAPOR",
            html: emailHtml,
        });
    }
}

module.exports = EmailService;
const nodemailer = require("nodemailer");

async function sendEmail({ from, to, subject, html }) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        secure: true,
        port: 465,
        auth: {
            user: 'resend',
            pass: process.env.RESEND_API_KEY,
        },
    });

    try {
        await transporter.sendMail({
            from,
            to,
            subject,
            html,
        });

    } catch (error) {
        // SMTP connection failed, wrong API key, etc.
        console.error('Email sending failed:', error.message);
        // Don't crash — handle gracefully
    }
}

module.exports = sendEmail;

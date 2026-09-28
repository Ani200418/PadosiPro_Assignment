const nodemailer = require('nodemailer');

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    })
  : null;

async function sendOtpEmail(to, otp) {
  if (!transporter) {
    console.log(`[DEV] SMTP not configured. OTP for ${to}: ${otp}`);
    return;
  }
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: 'Your PadosiPro verification code',
    text: `Your verification code is ${otp}. It expires in 10 minutes.`,
  });
}

module.exports = { sendOtpEmail };

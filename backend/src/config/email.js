import nodemailer from 'nodemailer';

let transporter = null;

export async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {

    transporter = {
      sendMail: async (options) => {
        console.log('📧 [DEV EMAIL] To:', options.to, '| Subject:', options.subject);
        return { messageId: `dev-mock-${Date.now()}` };
      },
    };
  }

  return transporter;
}

export default { getTransporter };

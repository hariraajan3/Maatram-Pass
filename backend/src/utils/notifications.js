import { getTransporter } from '../config/email.js';
import prisma from '../../lib/prisma.js';

export async function logEmail(recipient, template, status, meta = null) {
  try {
    return await prisma.emailLog.create({
      data: {
        recipient,
        template,
        status,
        meta: meta ? meta : undefined,
      },
    });
  } catch (err) {
    console.error('Failed to log email:', err);
  }
}

export async function sendSelectionEmail({ to, volunteerName, opportunity }) {
  try {
    const transporter = await getTransporter();
    const subject = `You have been selected for: ${opportunity.title}`;
    const locationInfo = opportunity.isOnline
      ? `Online Link: ${opportunity.meetingLink || 'Link will be shared shortly'}`
      : `Location: ${opportunity.location || 'Maatram Office'}`;

    const text = `Dear ${volunteerName},\n\nYou have been selected to volunteer for "${opportunity.title}".\n\nDate & Time: ${new Date(opportunity.startAt).toLocaleString()} - ${new Date(opportunity.endAt).toLocaleString()}\n${locationInfo}\n\nPlease log in to your Maatram Pass dashboard to confirm your attendance.\n\nWarm regards,\nMaatram Foundation`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@maatram.org',
      to,
      subject,
      text,
    });

    await logEmail(to, 'SELECTION_EMAIL', 'SENT', { opportunityId: opportunity.id });
    return true;
  } catch (err) {
    console.error('Failed to send selection email:', err);
    await logEmail(to, 'SELECTION_EMAIL', 'FAILED', { error: err.message });
    return false;
  }
}

export async function sendThankYouEmail({ to, volunteerName, opportunity, hours, totalHours, hasLinkedInConsent }) {
  try {
    const transporter = await getTransporter();
    const subject = `Thank you for volunteering at ${opportunity.title}!`;

    let text = `Dear ${volunteerName},\n\nThank you for volunteering your time at "${opportunity.title}".\nHours for this event: ${hours} hrs\nTotal volunteered hours to date: ${totalHours} hrs.\n`;

    if (hasLinkedInConsent) {
      const formattedDate = new Date(opportunity.startAt).toLocaleDateString('en-GB');
      const postText = `Proud to have volunteered ${hours} hours at Maatram's ${opportunity.category} on ${formattedDate}. #Maatram #Volunteering`;
      text += `\nReady-to-share LinkedIn Post:\n"${postText}"\n`;
    }

    text += `\nKeep inspiring change!\nMaatram Foundation`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@maatram.org',
      to,
      subject,
      text,
    });

    await logEmail(to, 'THANK_YOU_EMAIL', 'SENT', { opportunityId: opportunity.id, hours });
    return true;
  } catch (err) {
    console.error('Failed to send thank-you email:', err);
    await logEmail(to, 'THANK_YOU_EMAIL', 'FAILED', { error: err.message });
    return false;
  }
}

export default {
  logEmail,
  sendSelectionEmail,
  sendThankYouEmail,
};

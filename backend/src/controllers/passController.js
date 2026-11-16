import QRCode from 'qrcode';
import prisma from '../../lib/prisma.js';

export async function getPublicPass(req, res, next) {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employer: { select: { name: true } },
        badges: {
          include: { badge: true },
          orderBy: { awardedAt: 'desc' },
        },
        attendances: {
          where: { checkOut: { not: null } },
          include: { opportunity: { select: { category: true } } },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Volunteer pass not found.' });
    }

    // Top category calculation
    const catCounts = {};
    for (const a of user.attendances) {
      const cat = a.opportunity?.category || 'General';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    }

    let topCategory = 'Volunteering';
    let maxCount = 0;
    for (const [cat, cnt] of Object.entries(catCounts)) {
      if (cnt > maxCount) {
        maxCount = cnt;
        topCategory = cat.replace('_', ' ');
      }
    }

    const firstName = user.name.split(' ')[0];

    return res.json({
      pass: {
        userId: user.id,
        firstName,
        fullName: user.name,
        type: user.type,
        employer: user.employer?.name || null,
        totalHours: user.totalHours,
        totalEvents: user.totalEvents,
        topCategory,
        badges: user.badges,
        memberSince: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getPassQr(req, res, next) {
  try {
    const { userId } = req.params;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const passUrl = `${frontendUrl}/pass/public/${userId}`;

    const qrDataUrl = await QRCode.toDataURL(passUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#1e3a8a',
        light: '#ffffff',
      },
    });

    return res.json({ qrCode: qrDataUrl, passUrl });
  } catch (err) {
    next(err);
  }
}

export default {
  getPublicPass,
  getPassQr,
};

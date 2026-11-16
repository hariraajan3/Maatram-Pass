import prisma from '../../lib/prisma.js';

export async function getUser(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        employer: true,
        badges: { include: { badge: true } },
        consents: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found.' });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        type: user.type,
        employer: user.employer,
        skills: user.skills,
        totalHours: user.totalHours,
        totalEvents: user.totalEvents,
        doNotContact: user.doNotContact,
        badges: user.badges,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getUserBadges(req, res, next) {
  try {
    const badges = await prisma.userBadge.findMany({
      where: { userId: req.params.id },
      include: { badge: true },
      orderBy: { awardedAt: 'desc' },
    });
    return res.json({ badges });
  } catch (err) {
    next(err);
  }
}

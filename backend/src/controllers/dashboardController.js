import prisma from '../../lib/prisma.js';

export async function getVolunteerDashboard(req, res, next) {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employer: true,
        badges: {
          include: { badge: true },
          orderBy: { awardedAt: 'desc' },
        },
        consents: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Determine current rank among all approved volunteers
    const usersRanked = await prisma.user.findMany({
      where: { role: 'VOLUNTEER', status: 'APPROVED' },
      select: { id: true, totalEvents: true, totalHours: true },
      orderBy: [{ totalEvents: 'desc' }, { totalHours: 'desc' }],
    });

    const rank = usersRanked.findIndex(u => u.id === userId) + 1;

    // Upcoming confirmed opportunities
    const upcomingApplications = await prisma.application.findMany({
      where: {
        userId,
        status: { in: ['CONFIRMED', 'SELECTED'] },
        opportunity: { startAt: { gte: new Date() } },
      },
      include: { opportunity: true },
      orderBy: { opportunity: { startAt: 'asc' } },
      take: 5,
    });

    // Check latest consent for LINKEDIN_SHARE
    const latestLinkedInConsent = user.consents.find(c => c.type === 'LINKEDIN_SHARE')?.granted ?? false;

    // Ready-to-share LinkedIn template
    let linkedInPost = null;
    if (latestLinkedInConsent && user.totalHours > 0) {
      linkedInPost = `Proud to have contributed ${user.totalHours} hours across ${user.totalEvents} events with the Maatram Foundation community! #Maatram #Volunteering #GiveBack`;
    }

    // Next badge progress calculation
    const allBadges = await prisma.badge.findMany();
    const earnedBadgeIds = new Set(user.badges.map(b => b.badgeId));

    let nextBadge = null;
    if (user.totalEvents < 1) nextBadge = { label: 'First Step (1 event)', progress: 0, target: 1, current: 0 };
    else if (user.totalEvents < 5) nextBadge = { label: 'High Five (5 events)', progress: Math.round((user.totalEvents / 5) * 100), target: 5, current: user.totalEvents };
    else if (user.totalEvents < 10) nextBadge = { label: 'Event Veteran (10 events)', progress: Math.round((user.totalEvents / 10) * 100), target: 10, current: user.totalEvents };
    else if (user.totalHours < 10) nextBadge = { label: '10 Hours Strong', progress: Math.round((user.totalHours / 10) * 100), target: 10, current: user.totalHours };
    else if (user.totalHours < 25) nextBadge = { label: 'Quarter Century (25 hrs)', progress: Math.round((user.totalHours / 25) * 100), target: 25, current: user.totalHours };
    else if (user.totalHours < 50) nextBadge = { label: 'Half Century (50 hrs)', progress: Math.round((user.totalHours / 50) * 100), target: 50, current: user.totalHours };

    return res.json({
      dashboard: {
        totalHours: user.totalHours,
        totalEvents: user.totalEvents,
        rank: rank > 0 ? rank : 1,
        badges: user.badges,
        nextBadge,
        upcomingOpportunities: upcomingApplications.map(a => a.opportunity),
        canShareLinkedIn: latestLinkedInConsent,
        linkedInPost,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getLeaderboard(req, res, next) {
  try {
    const { month } = req.query; // YYYY-MM or undefined

    if (month) {
      const [year, m] = month.split('-').map(Number);
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 0, 23, 59, 59);

      const records = await prisma.attendance.findMany({
        where: {
          checkIn: { gte: start, lte: end },
          checkOut: { not: null },
        },
        include: {
          user: {
            select: { id: true, name: true, type: true, employer: true },
          },
        },
      });

      const userMap = {};
      for (const r of records) {
        if (!userMap[r.userId]) {
          userMap[r.userId] = {
            id: r.user.id,
            name: r.user.name,
            type: r.user.type,
            employer: r.user.employer?.name || null,
            events: 0,
            hours: 0,
          };
        }
        userMap[r.userId].events += 1;
        userMap[r.userId].hours += (r.hours || 0);
      }

      const leaders = Object.values(userMap)
        .sort((a, b) => b.events - a.events || b.hours - a.hours)
        .slice(0, 20);

      return res.json({ month, leaderboard: leaders });
    }

    // All-time leaderboard
    const users = await prisma.user.findMany({
      where: { role: 'VOLUNTEER', status: 'APPROVED' },
      select: {
        id: true,
        name: true,
        type: true,
        employer: { select: { name: true } },
        totalEvents: true,
        totalHours: true,
      },
      orderBy: [{ totalEvents: 'desc' }, { totalHours: 'desc' }],
      take: 20,
    });

    const formatted = users.map(u => ({
      id: u.id,
      name: u.name,
      type: u.type,
      employer: u.employer?.name || null,
      events: u.totalEvents,
      hours: u.totalHours,
    }));

    return res.json({ month: 'all-time', leaderboard: formatted });
  } catch (err) {
    next(err);
  }
}

export default {
  getVolunteerDashboard,
  getLeaderboard,
};

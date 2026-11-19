import cron from 'node-cron';
import prisma from '../../lib/prisma.js';

export function initCronJobs() {

  // 1. Nightly at 00:05 - Auto-close unclosed attendance sessions
  cron.schedule('5 0 * * *', async () => {
    try {
      console.log('🌙 Running nightly attendance check...');
      const openAttendances = await prisma.attendance.findMany({
        where: {
          checkIn: { not: null },
          checkOut: null,
          opportunity: { endAt: { lt: new Date() } },
        },
        include: { opportunity: true },
      });

      for (const att of openAttendances) {
        const diffMs = att.opportunity.endAt.getTime() - att.checkIn.getTime();
        const hours = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10);

        await prisma.attendance.update({
          where: { id: att.id },
          data: {
            checkOut: att.opportunity.endAt,
            hours,
            needsReview: true,
            overrideNote: 'Auto-closed by system nightly job.',
          },
        });
      }
      console.log(`🌙 Nightly attendance check completed. Processed ${openAttendances.length} sessions.`);
    } catch (err) {
      console.error('Error in nightly attendance cron:', err);
    }
  });

  // 2. 1st day of month at 00:10 - Award monthly top badges
  cron.schedule('10 0 1 * *', async () => {
    try {
      const now = new Date();
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const monthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
      console.log(`🏆 Awarding monthly badges for ${monthStr}...`);

      const start = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
      const end = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0, 23, 59, 59);

      const records = await prisma.attendance.findMany({
        where: {
          checkIn: { gte: start, lte: end },
          checkOut: { not: null },
        },
      });

      const userStats = {};
      for (const rec of records) {
        if (!userStats[rec.userId]) userStats[rec.userId] = { events: 0, hours: 0 };
        userStats[rec.userId].events += 1;
        userStats[rec.userId].hours += (rec.hours || 0);
      }

      const ranked = Object.entries(userStats)
        .map(([userId, data]) => ({ userId, ...data }))
        .sort((a, b) => b.events - a.events || b.hours - a.hours);

      const badges = await prisma.badge.findMany();
      const top1 = badges.find(b => b.type === 'LEADERBOARD_TOP1');
      const top2 = badges.find(b => b.type === 'LEADERBOARD_TOP2');
      const top3 = badges.find(b => b.type === 'LEADERBOARD_TOP3');

      if (ranked[0] && top1) {
        await prisma.userBadge.upsert({
          where: { userId_badgeId_month: { userId: ranked[0].userId, badgeId: top1.id, month: monthStr } },
          create: { userId: ranked[0].userId, badgeId: top1.id, month: monthStr },
          update: {},
        });
      }
      if (ranked[1] && top2) {
        await prisma.userBadge.upsert({
          where: { userId_badgeId_month: { userId: ranked[1].userId, badgeId: top2.id, month: monthStr } },
          create: { userId: ranked[1].userId, badgeId: top2.id, month: monthStr },
          update: {},
        });
      }
      if (ranked[2] && top3) {
        await prisma.userBadge.upsert({
          where: { userId_badgeId_month: { userId: ranked[2].userId, badgeId: top3.id, month: monthStr } },
          create: { userId: ranked[2].userId, badgeId: top3.id, month: monthStr },
          update: {},
        });
      }
      console.log(`🏆 Monthly badges awarded for ${monthStr}`);
    } catch (err) {
      console.error('Error in monthly badges cron:', err);
    }
  });
}

export const registerCronJobs = initCronJobs;
export default { initCronJobs, registerCronJobs };

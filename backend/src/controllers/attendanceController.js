import prisma from '../../lib/prisma.js';
import { logAudit } from '../utils/auditLogger.js';

async function checkAndAwardBadges(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { badges: true },
    });
    if (!user) return;

    const existingBadgeTypes = new Set();
    const badges = await prisma.badge.findMany();
    const badgeMap = {};
    for (const b of badges) {
      badgeMap[b.type] = b.id;
    }

    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
    });
    userBadges.forEach(ub => existingBadgeTypes.add(ub.badge.type));

    const toAward = [];
    // Event milestones
    if (user.totalEvents >= 1 && !existingBadgeTypes.has('EVENT_1')) toAward.push('EVENT_1');
    if (user.totalEvents >= 5 && !existingBadgeTypes.has('EVENT_5')) toAward.push('EVENT_5');
    if (user.totalEvents >= 10 && !existingBadgeTypes.has('EVENT_10')) toAward.push('EVENT_10');

    // Hour milestones
    if (user.totalHours >= 10 && !existingBadgeTypes.has('HOURS_10')) toAward.push('HOURS_10');
    if (user.totalHours >= 25 && !existingBadgeTypes.has('HOURS_25')) toAward.push('HOURS_25');
    if (user.totalHours >= 50 && !existingBadgeTypes.has('HOURS_50')) toAward.push('HOURS_50');

    for (const bType of toAward) {
      if (badgeMap[bType]) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badgeMap[bType],
          },
        });
        await logAudit({
          actorId: userId,
          action: 'BADGE_AWARDED',
          entity: 'Badge',
          entityId: badgeMap[bType],
          meta: { badgeType: bType },
        });
      }
    }
  } catch (err) {
    console.error('Error awarding milestone badges:', err);
  }
}

export async function checkIn(req, res, next) {
  try {
    const { userId, opportunityId, method = 'QR', overrideNote } = req.body;

    if (!userId || !opportunityId) {
      return res.status(400).json({ error: 'userId and opportunityId are required.' });
    }

    // Check if volunteer is CONFIRMED for this opportunity
    const application = await prisma.application.findUnique({
      where: { userId_opportunityId: { userId, opportunityId } },
    });

    if ((!application || application.status !== 'CONFIRMED') && !overrideNote) {
      return res.status(403).json({
        error: 'Volunteer is not confirmed for this event. An override note is required by staff to proceed.',
        needsOverride: true,
      });
    }

    // Check for existing open check-in
    const existing = await prisma.attendance.findFirst({
      where: {
        userId,
        opportunityId,
        checkIn: { not: null },
        checkOut: null,
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Volunteer is already checked in for this opportunity.' });
    }

    const attendance = await prisma.attendance.create({
      data: {
        userId,
        opportunityId,
        checkIn: new Date(),
        method: method === 'MANUAL' ? 'MANUAL' : 'QR',
        overrideNote: overrideNote || null,
      },
      include: { user: true, opportunity: true },
    });

    // Update application to ATTENDED
    if (application) {
      await prisma.application.update({
        where: { id: application.id },
        data: { status: 'ATTENDED' },
      });
    }

    await logAudit({
      actorId: req.user.id,
      action: 'VOLUNTEER_CHECKIN',
      entity: 'Attendance',
      entityId: attendance.id,
      meta: { method, volunteerId: userId, overrideNote },
    });

    return res.status(201).json({
      message: `Checked in successfully: ${attendance.user.name}`,
      attendance,
    });
  } catch (err) {
    next(err);
  }
}

export async function checkOut(req, res, next) {
  try {
    const { attendanceId, userId, opportunityId } = req.body;

    let attendance = null;
    if (attendanceId) {
      attendance = await prisma.attendance.findUnique({
        where: { id: attendanceId },
        include: { user: true, opportunity: true },
      });
    } else if (userId && opportunityId) {
      attendance = await prisma.attendance.findFirst({
        where: { userId, opportunityId, checkOut: null },
        include: { user: true, opportunity: true },
      });
    }

    if (!attendance) {
      return res.status(404).json({ error: 'Active check-in session not found.' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ error: 'Volunteer has already checked out.' });
    }

    const checkOutTime = new Date();
    const diffMs = checkOutTime.getTime() - new Date(attendance.checkIn).getTime();
    const hours = Math.max(0.1, Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10);

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: checkOutTime,
        hours,
      },
    });

    // Increment user's total hours and total events
    await prisma.user.update({
      where: { id: attendance.userId },
      data: {
        totalHours: { increment: hours },
        totalEvents: { increment: 1 },
      },
    });

    // Check & award badges
    await checkAndAwardBadges(attendance.userId);

    await logAudit({
      actorId: req.user.id,
      action: 'VOLUNTEER_CHECKOUT',
      entity: 'Attendance',
      entityId: attendance.id,
      meta: { hours, volunteerId: attendance.userId },
    });

    return res.json({
      message: `Checked out successfully: ${attendance.user.name} (${hours} hrs)`,
      attendance: updated,
      hours,
    });
  } catch (err) {
    next(err);
  }
}

export async function getOpportunityAttendance(req, res, next) {
  try {
    const { opportunityId } = req.params;
    const records = await prisma.attendance.findMany({
      where: { opportunityId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
            employer: true,
          },
        },
      },
      orderBy: { checkIn: 'desc' },
    });

    return res.json({ attendance: records });
  } catch (err) {
    next(err);
  }
}

export async function getNeedsReview(req, res, next) {
  try {
    const records = await prisma.attendance.findMany({
      where: { needsReview: true },
      include: {
        user: { select: { id: true, name: true, email: true } },
        opportunity: { select: { id: true, title: true, startAt: true, endAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ needsReview: records });
  } catch (err) {
    next(err);
  }
}

export async function editAttendance(req, res, next) {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, hours, needsReview, overrideNote } = req.body;

    const current = await prisma.attendance.findUnique({ where: { id } });
    if (!current) {
      return res.status(404).json({ error: 'Attendance record not found.' });
    }

    const data = {};
    if (checkIn) data.checkIn = new Date(checkIn);
    if (checkOut) data.checkOut = new Date(checkOut);
    if (hours !== undefined) data.hours = Number(hours);
    if (needsReview !== undefined) data.needsReview = Boolean(needsReview);
    if (overrideNote !== undefined) data.overrideNote = overrideNote;

    const updated = await prisma.attendance.update({
      where: { id },
      data,
    });

    await logAudit({
      actorId: req.user.id,
      action: 'ATTENDANCE_MANUALLY_EDITED',
      entity: 'Attendance',
      entityId: id,
      meta: { previous: current, updated: data },
    });

    return res.json({ message: 'Attendance updated successfully.', attendance: updated });
  } catch (err) {
    next(err);
  }
}

export default {
  checkIn,
  checkOut,
  getOpportunityAttendance,
  getNeedsReview,
  editAttendance,
};

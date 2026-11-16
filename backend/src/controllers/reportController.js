import prisma from '../../lib/prisma.js';

export async function getEngagementReport(req, res, next) {
  try {
    const windowSetting = await prisma.setting.findUnique({ where: { key: 'windowMonths' } });
    const freqSetting = await prisma.setting.findUnique({ where: { key: 'frequentMinEvents' } });

    const windowMonths = Number(windowSetting?.value) || 4;
    const frequentMinEvents = Number(freqSetting?.value) || 3;

    const now = new Date();
    const windowStart = new Date(now.getFullYear(), now.getMonth() - windowMonths, now.getDate());
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());

    // 2. Fetch all approved volunteers with attendance
    const volunteers = await prisma.user.findMany({
      where: { role: 'VOLUNTEER', status: 'APPROVED' },
      include: {
        attendances: {
          where: { checkOut: { not: null } },
          include: { opportunity: true },
        },
        employer: true,
      },
    });

    const frequent = [];
    const occasional = [];
    const quiet = [];
    const noHistory = [];
    const driftingAway = [];
    const alumniScores = [];

    let studentCount = 0;
    let alumniCount = 0;

    for (const v of volunteers) {
      if (v.type === 'STUDENT') studentCount++;
      if (v.type === 'ALUMNI') alumniCount++;

      const attendancesInWindow = v.attendances.filter(a => new Date(a.checkIn) >= windowStart);
      const totalPastEvents = v.attendances.length;
      const windowEvents = attendancesInWindow.length;
      const windowHours = attendancesInWindow.reduce((acc, cur) => acc + (cur.hours || 0), 0);

      const volunteerSummary = {
        id: v.id,
        name: v.name,
        type: v.type,
        employer: v.employer?.name || null,
        skills: v.skills,
        windowEvents,
        windowHours: Math.round(windowHours * 10) / 10,
        totalEvents: totalPastEvents,
        totalHours: v.totalHours,
      };

      if (totalPastEvents === 0) {
        noHistory.push(volunteerSummary);
      } else if (windowEvents >= frequentMinEvents) {
        frequent.push(volunteerSummary);
      } else if (windowEvents > 0) {
        occasional.push(volunteerSummary);
      } else {
        // Quiet: has history, but 0 in current window
        quiet.push(volunteerSummary);
        driftingAway.push(volunteerSummary);
      }

      // Alumni consistency score: active months in last 12 / 12
      if (v.type === 'ALUMNI') {
        const monthsSet = new Set();
        v.attendances
          .filter(a => new Date(a.checkIn) >= twelveMonthsAgo)
          .forEach(a => {
            const d = new Date(a.checkIn);
            monthsSet.add(`${d.getFullYear()}-${d.getMonth()}`);
          });

        const activeMonths = monthsSet.size;
        const consistencyScore = Math.round((activeMonths / 12) * 100) / 100;

        alumniScores.push({
          id: v.id,
          name: v.name,
          employer: v.employer?.name || null,
          activeMonths,
          consistencyScore,
        });
      }
    }

    const windowLabel = `${windowStart.toLocaleDateString('en-GB')} – ${now.toLocaleDateString('en-GB')} (last ${windowMonths} months)`;

    return res.json({
      windowMonths,
      frequentMinEvents,
      windowLabel,
      segments: {
        frequent,
        occasional,
        quiet,
        noHistory,
      },
      driftingAway,
      alumniScores: alumniScores.sort((a, b) => b.consistencyScore - a.consistencyScore),
      studentAlumniSplit: {
        students: studentCount,
        alumni: alumniCount,
        total: volunteers.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getEmployerReport(req, res, next) {
  try {
    const { employerId, from, to } = req.query;

    if (!employerId) {
      return res.status(400).json({ error: 'employerId is required.' });
    }

    const employer = await prisma.employer.findUnique({
      where: { id: employerId },
      include: { aliases: true },
    });

    if (!employer) {
      return res.status(404).json({ error: 'Employer not found.' });
    }

    const attendanceWhere = {
      user: { employerId },
      checkOut: { not: null },
    };

    if (from || to) {
      attendanceWhere.checkIn = {};
      if (from) attendanceWhere.checkIn.gte = new Date(from);
      if (to) attendanceWhere.checkIn.lte = new Date(to);
    }

    const attendances = await prisma.attendance.findMany({
      where: attendanceWhere,
      include: {
        user: { select: { id: true, name: true, email: true, type: true } },
        opportunity: { select: { id: true, title: true, category: true, startAt: true } },
      },
    });

    const uniqueVolunteers = new Set(attendances.map(a => a.userId));
    const uniqueOpportunities = new Set(attendances.map(a => a.opportunityId));
    const totalHours = attendances.reduce((sum, a) => sum + (a.hours || 0), 0);

    return res.json({
      employer: {
        id: employer.id,
        name: employer.name,
        aliases: employer.aliases.map(a => a.alias),
      },
      period: { from: from || 'All time', to: to || 'Present' },
      metrics: {
        totalVolunteers: uniqueVolunteers.size,
        totalEvents: attendances.length,
        uniqueEvents: uniqueOpportunities.size,
        totalHours: Math.round(totalHours * 10) / 10,
      },
      attendances: attendances.map(a => ({
        id: a.id,
        volunteerName: a.user.name,
        volunteerType: a.user.type,
        eventTitle: a.opportunity.title,
        category: a.opportunity.category,
        date: a.opportunity.startAt,
        hours: a.hours,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getEmployerCsv(req, res, next) {
  try {
    const { employerId, from, to } = req.query;
    if (!employerId) {
      return res.status(400).send('employerId is required');
    }

    const employer = await prisma.employer.findUnique({ where: { id: employerId } });
    if (!employer) return res.status(404).send('Employer not found');

    const attendanceWhere = {
      user: { employerId },
      checkOut: { not: null },
    };

    if (from || to) {
      attendanceWhere.checkIn = {};
      if (from) attendanceWhere.checkIn.gte = new Date(from);
      if (to) attendanceWhere.checkIn.lte = new Date(to);
    }

    const attendances = await prisma.attendance.findMany({
      where: attendanceWhere,
      include: {
        user: true,
        opportunity: true,
      },
    });

    let csv = 'Employer,Volunteer Name,Type,Opportunity,Category,Date,Hours\n';
    for (const a of attendances) {
      const dateStr = a.opportunity.startAt.toISOString().split('T')[0];
      csv += `"${employer.name}","${a.user.name}","${a.user.type || ''}","${a.opportunity.title}","${a.opportunity.category}","${dateStr}",${a.hours || 0}\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${employer.name}-contribution-report.csv"`);
    return res.send(csv);
  } catch (err) {
    next(err);
  }
}

// SPEC: ONE SHARED BACKEND HELPER (getContactableVolunteers)
export async function getContactableVolunteers(filters = {}) {
  const volunteers = await prisma.user.findMany({
    where: {
      role: 'VOLUNTEER',
      status: 'APPROVED',
    },
    include: {
      consents: { orderBy: { createdAt: 'desc' } },
      employer: true,
    },
  });

  const available = [];
  const doNotContactList = [];

  for (const v of volunteers) {
    const latestInterviewConsent = v.consents.find(c => c.type === 'INTERVIEW_CONTACT')?.granted ?? false;
    const isDoNotContact = v.doNotContact;

    let reason = null;
    if (isDoNotContact && !latestInterviewConsent) {
      reason = 'User flagged do-not-contact & no interview consent';
    } else if (isDoNotContact) {
      reason = 'User flagged do-not-contact';
    } else if (!latestInterviewConsent) {
      reason = 'No interview consent granted';
    }

    const record = {
      id: v.id,
      name: v.name,
      email: v.email,
      type: v.type,
      employer: v.employer?.name || null,
      skills: v.skills,
      totalHours: v.totalHours,
      totalEvents: v.totalEvents,
    };

    if (latestInterviewConsent && !isDoNotContact) {
      available.push(record);
    } else {
      doNotContactList.push({ ...record, reason });
    }
  }

  return { available, doNotContactList };
}

export async function getWhoToCall(req, res, next) {
  try {
    const result = await getContactableVolunteers();
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

export default {
  getEngagementReport,
  getEmployerReport,
  getEmployerCsv,
  getWhoToCall,
};

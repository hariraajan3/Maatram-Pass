import prisma from '../../lib/prisma.js';
import { logAudit } from '../utils/auditLogger.js';
import { sendSelectionEmail } from '../utils/notifications.js';

export async function applyOrInterest(req, res, next) {
  try {
    const { opportunityId, interested } = req.body;
    const userId = req.user.id;

    const opp = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!opp) {
      return res.status(404).json({ error: 'Opportunity not found.' });
    }

    if (opp.status !== 'OPEN') {
      return res.status(400).json({ error: 'This opportunity is not open for applications.' });
    }

    if (new Date() > new Date(opp.deadline)) {
      return res.status(400).json({ error: 'The application deadline has passed.' });
    }

    const application = await prisma.application.upsert({
      where: {
        userId_opportunityId: { userId, opportunityId },
      },
      create: {
        userId,
        opportunityId,
        interested: Boolean(interested),
        status: 'APPLIED',
      },
      update: {
        interested: Boolean(interested),
        status: 'APPLIED',
      },
    });

    await logAudit({
      actorId: userId,
      action: interested ? 'EXPRESSED_INTEREST' : 'APPLIED_TO_OPPORTUNITY',
      entity: 'Application',
      entityId: application.id,
      meta: { opportunityTitle: opp.title },
    });

    return res.status(201).json({ message: 'Application submitted successfully.', application });
  } catch (err) {
    next(err);
  }
}

export async function getMyApplications(req, res, next) {
  try {
    const applications = await prisma.application.findMany({
      where: { userId: req.user.id },
      include: {
        opportunity: true,
      },
      orderBy: { appliedAt: 'desc' },
    });

    return res.json({ applications });
  } catch (err) {
    next(err);
  }
}

export async function selectVolunteer(req, res, next) {
  try {
    const { id } = req.params; // application id

    const app = await prisma.application.findUnique({
      where: { id },
      include: { opportunity: true, user: true },
    });

    if (!app) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    // Check capacity: count already selected or confirmed
    const selectedCount = await prisma.application.count({
      where: {
        opportunityId: app.opportunityId,
        status: { in: ['SELECTED', 'CONFIRMED'] },
      },
    });

    let newStatus = 'SELECTED';
    if (selectedCount >= app.opportunity.capacity) {
      newStatus = 'WAITLISTED';
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status: newStatus },
    });

    if (newStatus === 'SELECTED') {
      // Send selection email
      await sendSelectionEmail({
        to: app.user.email,
        volunteerName: app.user.name,
        opportunity: app.opportunity,
      });
    }

    await logAudit({
      actorId: req.user.id,
      action: `VOLUNTEER_${newStatus}`,
      entity: 'Application',
      entityId: id,
      meta: { volunteerEmail: app.user.email, opportunityTitle: app.opportunity.title },
    });

    return res.json({
      message: newStatus === 'SELECTED' ? 'Volunteer selected and notification email sent.' : 'Capacity full. Volunteer added to waitlist.',
      application: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function confirmApplication(req, res, next) {
  try {
    const { id } = req.params;
    const { confirm } = req.body; // true = CONFIRMED, false = DECLINED

    const app = await prisma.application.findUnique({
      where: { id },
      include: { opportunity: true },
    });

    if (!app) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    if (app.userId !== req.user.id && req.user.role === 'VOLUNTEER') {
      return res.status(403).json({ error: 'You can only confirm your own selection.' });
    }

    const newStatus = confirm ? 'CONFIRMED' : 'DECLINED';

    const updated = await prisma.application.update({
      where: { id },
      data: { status: newStatus },
    });

    await logAudit({
      actorId: req.user.id,
      action: `VOLUNTEER_${newStatus}`,
      entity: 'Application',
      entityId: id,
      meta: { opportunityTitle: app.opportunity.title },
    });

    return res.json({ message: `Selection ${confirm ? 'confirmed' : 'declined'}.`, application: updated });
  } catch (err) {
    next(err);
  }
}

export async function withdrawApplication(req, res, next) {
  try {
    const { id } = req.params;

    const app = await prisma.application.findUnique({
      where: { id },
      include: { opportunity: true },
    });

    if (!app) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    if (app.userId !== req.user.id && req.user.role === 'VOLUNTEER') {
      return res.status(403).json({ error: 'You can only withdraw your own application.' });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status: 'WITHDRAWN' },
    });

    await logAudit({
      actorId: req.user.id,
      action: 'VOLUNTEER_WITHDRAWN',
      entity: 'Application',
      entityId: id,
    });

    return res.json({ message: 'Application withdrawn successfully.', application: updated });
  } catch (err) {
    next(err);
  }
}

export async function promoteFromWaitlist(req, res, next) {
  try {
    const { id } = req.params;

    const app = await prisma.application.findUnique({
      where: { id },
      include: { opportunity: true, user: true },
    });

    if (!app || app.status !== 'WAITLISTED') {
      return res.status(400).json({ error: 'Only waitlisted applications can be promoted.' });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status: 'SELECTED' },
    });

    await sendSelectionEmail({
      to: app.user.email,
      volunteerName: app.user.name,
      opportunity: app.opportunity,
    });

    await logAudit({
      actorId: req.user.id,
      action: 'WAITLIST_PROMOTED_TO_SELECTED',
      entity: 'Application',
      entityId: id,
      meta: { volunteerEmail: app.user.email },
    });

    return res.json({ message: 'Volunteer promoted to selected and notified.', application: updated });
  } catch (err) {
    next(err);
  }
}

export default {
  applyOrInterest,
  getMyApplications,
  selectVolunteer,
  confirmApplication,
  withdrawApplication,
  promoteFromWaitlist,
};

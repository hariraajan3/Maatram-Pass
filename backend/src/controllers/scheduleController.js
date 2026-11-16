import prisma from '../../lib/prisma.js';
import { logAudit } from '../utils/auditLogger.js';
import { sendThankYouEmail } from '../utils/notifications.js';

export async function listOpportunities(req, res, next) {
  try {
    const { status, category, search } = req.query;
    const where = {};

    // Volunteers only see OPEN or LIVE opportunities
    if (req.user.role === 'VOLUNTEER') {
      where.status = { in: ['OPEN', 'LIVE'] };
    } else if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      include: {
        _count: {
          select: { applications: true, attendances: true },
        },
      },
      orderBy: { startAt: 'asc' },
    });

    return res.json({ opportunities });
  } catch (err) {
    next(err);
  }
}

export async function createOpportunity(req, res, next) {
  try {
    const {
      title,
      description,
      category,
      isOnline,
      location,
      meetingLink,
      startAt,
      endAt,
      deadline,
      capacity,
      requiredSkills,
      eligibility,
    } = req.body;

    if (!title || !description || !category || !startAt || !endAt || !deadline || !capacity) {
      return res.status(400).json({ error: 'Missing required opportunity fields.' });
    }

    const opp = await prisma.opportunity.create({
      data: {
        title,
        description,
        category,
        isOnline: Boolean(isOnline),
        location: isOnline ? null : location,
        meetingLink: isOnline ? meetingLink : null,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        deadline: new Date(deadline),
        capacity: Number(capacity),
        requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
        eligibility: eligibility || null,
        status: 'OPEN',
        createdById: req.user.id,
      },
    });

    await logAudit({
      actorId: req.user.id,
      action: 'OPPORTUNITY_CREATED',
      entity: 'Opportunity',
      entityId: opp.id,
      meta: { title, category },
    });

    return res.status(201).json({ message: 'Opportunity created successfully.', opportunity: opp });
  } catch (err) {
    next(err);
  }
}

export async function getOpportunityById(req, res, next) {
  try {
    const { id } = req.params;
    const opp = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                type: true,
                skills: true,
                employer: true,
                totalHours: true,
                totalEvents: true,
              },
            },
          },
          orderBy: { appliedAt: 'asc' },
        },
        attendances: {
          include: {
            user: {
              select: { id: true, name: true, email: true, type: true },
            },
          },
          orderBy: { checkIn: 'desc' },
        },
        _count: {
          select: { applications: true, attendances: true },
        },
      },
    });

    if (!opp) {
      return res.status(404).json({ error: 'Opportunity not found.' });
    }

    return res.json({ opportunity: opp });
  } catch (err) {
    next(err);
  }
}

export async function updateOpportunity(req, res, next) {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (data.startAt) data.startAt = new Date(data.startAt);
    if (data.endAt) data.endAt = new Date(data.endAt);
    if (data.deadline) data.deadline = new Date(data.deadline);
    if (data.capacity) data.capacity = Number(data.capacity);

    const updated = await prisma.opportunity.update({
      where: { id },
      data,
    });

    await logAudit({
      actorId: req.user.id,
      action: 'OPPORTUNITY_UPDATED',
      entity: 'Opportunity',
      entityId: id,
    });

    return res.json({ message: 'Opportunity updated successfully.', opportunity: updated });
  } catch (err) {
    next(err);
  }
}

export async function updateOpportunityStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const opp = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        attendances: {
          include: {
            user: {
              include: {
                consents: { orderBy: { createdAt: 'desc' } },
              },
            },
          },
        },
      },
    });

    if (!opp) {
      return res.status(404).json({ error: 'Opportunity not found.' });
    }

    const updated = await prisma.opportunity.update({
      where: { id },
      data: { status },
    });

    // When status changes to COMPLETED, send thank-you notes!
    if (status === 'COMPLETED') {
      for (const att of opp.attendances) {
        if (att.checkIn && att.user) {
          const hasLinkedIn = att.user.consents.find(c => c.type === 'LINKEDIN_SHARE')?.granted ?? false;
          await sendThankYouEmail({
            to: att.user.email,
            volunteerName: att.user.name,
            opportunity: opp,
            hours: att.hours || 0,
            totalHours: att.user.totalHours,
            hasLinkedInConsent: hasLinkedIn,
          });
        }
      }
    }

    await logAudit({
      actorId: req.user.id,
      action: `OPPORTUNITY_STATUS_${status}`,
      entity: 'Opportunity',
      entityId: id,
    });

    return res.json({ message: `Opportunity status changed to ${status}`, opportunity: updated });
  } catch (err) {
    next(err);
  }
}

export default {
  listOpportunities,
  createOpportunity,
  getOpportunityById,
  updateOpportunity,
  updateOpportunityStatus,
};

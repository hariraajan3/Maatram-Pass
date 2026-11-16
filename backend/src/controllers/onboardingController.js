import prisma from '../../lib/prisma.js';
import { logAudit } from '../utils/auditLogger.js';

export async function getConsents(req, res, next) {
  try {
    const consents = await prisma.consent.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    const current = {};
    for (const c of consents) {
      if (current[c.type] === undefined) {
        current[c.type] = c.granted;
      }
    }

    return res.json({ consents: current, history: consents });
  } catch (err) {
    next(err);
  }
}

export async function updateConsent(req, res, next) {
  try {
    const { type, granted } = req.body;

    if (!['DATA_USE', 'INTERVIEW_CONTACT', 'LINKEDIN_SHARE'].includes(type)) {
      return res.status(400).json({ error: 'Invalid consent type.' });
    }

    if (typeof granted !== 'boolean') {
      return res.status(400).json({ error: 'granted must be a boolean.' });
    }

    // Spec rule: Store consents in separate table with timestamp and never overwrite
    const consent = await prisma.consent.create({
      data: {
        userId: req.user.id,
        type,
        granted,
      },
    });

    await logAudit({
      actorId: req.user.id,
      action: 'CONSENT_UPDATED',
      entity: 'Consent',
      entityId: consent.id,
      meta: { type, granted },
    });

    return res.status(201).json({ message: 'Consent updated successfully.', consent });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { skills, employerId, doNotContact } = req.body;
    const data = {};

    if (skills !== undefined) data.skills = Array.isArray(skills) ? skills : [];
    if (employerId !== undefined) data.employerId = employerId || null;
    if (doNotContact !== undefined) data.doNotContact = Boolean(doNotContact);

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    await logAudit({
      actorId: req.user.id,
      action: 'PROFILE_UPDATED',
      entity: 'User',
      entityId: req.user.id,
    });

    return res.json({ message: 'Profile updated successfully.', user: updated });
  } catch (err) {
    next(err);
  }
}

export default {
  getConsents,
  updateConsent,
  updateProfile,
};

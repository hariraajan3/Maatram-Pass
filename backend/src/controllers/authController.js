import prisma from '../../lib/prisma.js';
import { signToken } from '../config/auth.js';
import { hashPassword, comparePassword } from '../utils/security.js';
import { logAudit } from '../utils/auditLogger.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, role, type, employerId, skills, consents } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const userRole = role === 'OFFICE_TEAM' ? 'OFFICE_TEAM' : 'VOLUNTEER';
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: userRole,
        status: 'PENDING',
        type: type || null,
        employerId: employerId || null,
        skills: Array.isArray(skills) ? skills : [],
      },
    });

    // Save consents if provided
    if (consents && typeof consents === 'object') {
      const consentEntries = Object.entries(consents)
        .filter(([_, granted]) => typeof granted === 'boolean')
        .map(([consentType, granted]) => ({
          userId: user.id,
          type: consentType,
          granted,
        }));

      if (consentEntries.length > 0) {
        await prisma.consent.createMany({ data: consentEntries });
      }
    }

    await logAudit({
      actorId: user.id,
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: user.id,
      meta: { email, role: userRole },
    });

    return res.status(201).json({
      message: 'Registration successful. Your account is pending approval by the team.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { employer: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      name: user.name,
    });

    return res.json({
      token,
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
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        employer: true,
        consents: { orderBy: { createdAt: 'desc' } },
        badges: { include: { badge: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Latest consent status map
    const latestConsents = {};
    for (const c of user.consents) {
      if (latestConsents[c.type] === undefined) {
        latestConsents[c.type] = c.granted;
      }
    }

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
        consents: latestConsents,
      },
    });
  } catch (err) {
    next(err);
  }
}

export default {
  register,
  login,
  getMe,
};

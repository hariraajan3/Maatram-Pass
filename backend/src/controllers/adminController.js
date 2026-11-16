import prisma from '../../lib/prisma.js';
import { logAudit } from '../utils/auditLogger.js';

export async function getUsers(req, res, next) {
  try {
    const { role, status, type } = req.query;
    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (type) where.type = type;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        type: true,
        skills: true,
        totalHours: true,
        totalEvents: true,
        doNotContact: true,
        createdAt: true,
        employer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ users });
  } catch (err) {
    next(err);
  }
}

export async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED', 'SUSPENDED', 'PENDING'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Spec rule: Office-team sign-ups are approved ONLY by an admin
    if (targetUser.role === 'OFFICE_TEAM' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Office-team accounts can only be approved by an Administrator.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
    });

    await logAudit({
      actorId: req.user.id,
      action: `ACCOUNT_STATUS_${status}`,
      entity: 'User',
      entityId: id,
      meta: { previousStatus: targetUser.status, newStatus: status },
    });

    return res.json({ message: `User status updated to ${status}`, user: updatedUser });
  } catch (err) {
    next(err);
  }
}

export async function getApprovalQueue(req, res, next) {
  try {
    const isOnlyAdmin = req.user.role === 'ADMIN';

    // Office team can see pending volunteers; Admin can see pending volunteers + pending office team
    const where = { status: 'PENDING' };
    if (!isOnlyAdmin) {
      where.role = 'VOLUNTEER';
    }

    const pendingUsers = await prisma.user.findMany({
      where,
      include: {
        employer: true,
        consents: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return res.json({ pendingUsers });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { actor: { select: { id: true, name: true, email: true, role: true } } },
      }),
      prisma.auditLog.count(),
    ]);

    return res.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

export async function getSettings(req, res, next) {
  try {
    const settingsList = await prisma.setting.findMany();
    const settingsMap = {};
    for (const s of settingsList) {
      settingsMap[s.key] = s.value;
    }
    return res.json({ settings: settingsMap });
  } catch (err) {
    next(err);
  }
}

export async function updateSetting(req, res, next) {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required.' });
    }

    const updated = await prisma.setting.upsert({
      where: { key },
      create: { key, value: String(value) },
      update: { value: String(value) },
    });

    await logAudit({
      actorId: req.user.id,
      action: 'SETTING_UPDATED',
      entity: 'Setting',
      entityId: key,
      meta: { key, value },
    });

    return res.json({ message: 'Setting updated successfully.', setting: updated });
  } catch (err) {
    next(err);
  }
}

export default {
  getUsers,
  updateUserStatus,
  getApprovalQueue,
  getAuditLogs,
  getSettings,
  updateSetting,
};

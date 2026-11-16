import prisma from '../../lib/prisma.js';
import { logAudit } from '../utils/auditLogger.js';

export async function getEmployers(req, res, next) {
  try {
    const employers = await prisma.employer.findMany({
      where: { status: 'APPROVED' },
      include: { aliases: true },
      orderBy: { name: 'asc' },
    });

    return res.json({ employers });
  } catch (err) {
    next(err);
  }
}

export async function suggestEmployer(req, res, next) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Company name is required.' });
    }

    const trimmed = name.trim();

    // Check if exists as name or alias
    const existing = await prisma.employer.findUnique({ where: { name: trimmed } });
    if (existing) {
      return res.status(409).json({ error: 'Company already exists.', employer: existing });
    }

    const existingAlias = await prisma.employerAlias.findUnique({
      where: { alias: trimmed },
      include: { employer: true },
    });
    if (existingAlias) {
      return res.json({ message: 'Matches an existing company alias.', employer: existingAlias.employer });
    }

    const newEmp = await prisma.employer.create({
      data: {
        name: trimmed,
        status: 'PENDING',
      },
    });

    await logAudit({
      actorId: req.user.id,
      action: 'EMPLOYER_SUGGESTED',
      entity: 'Employer',
      entityId: newEmp.id,
      meta: { name: trimmed },
    });

    return res.status(201).json({ message: 'Employer suggested for approval.', employer: newEmp });
  } catch (err) {
    next(err);
  }
}

export async function approveEmployer(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await prisma.employer.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    await logAudit({
      actorId: req.user.id,
      action: 'EMPLOYER_APPROVED',
      entity: 'Employer',
      entityId: id,
    });

    return res.json({ message: 'Employer approved.', employer: updated });
  } catch (err) {
    next(err);
  }
}

export async function mergeEmployer(req, res, next) {
  try {
    const { id } = req.params; // Source employer to merge
    const { targetEmployerId } = req.body;

    if (!targetEmployerId) {
      return res.status(400).json({ error: 'targetEmployerId is required.' });
    }

    const source = await prisma.employer.findUnique({ where: { id } });
    const target = await prisma.employer.findUnique({ where: { id: targetEmployerId } });

    if (!source || !target) {
      return res.status(404).json({ error: 'Source or target employer not found.' });
    }

    // 1. Re-point all users from source to target
    await prisma.user.updateMany({
      where: { employerId: source.id },
      data: { employerId: target.id },
    });

    // 2. Turn source name into an alias of target
    await prisma.employerAlias.upsert({
      where: { alias: source.name },
      create: { alias: source.name, employerId: target.id },
      update: { employerId: target.id },
    });

    // 3. Move existing aliases of source to target
    await prisma.employerAlias.updateMany({
      where: { employerId: source.id },
      data: { employerId: target.id },
    });

    // 4. Delete source employer
    await prisma.employer.delete({ where: { id: source.id } });

    await logAudit({
      actorId: req.user.id,
      action: 'EMPLOYER_MERGED',
      entity: 'Employer',
      entityId: target.id,
      meta: { sourceName: source.name, targetName: target.name },
    });

    return res.json({ message: `Successfully merged "${source.name}" into "${target.name}".` });
  } catch (err) {
    next(err);
  }
}

export default {
  getEmployers,
  suggestEmployer,
  approveEmployer,
  mergeEmployer,
};

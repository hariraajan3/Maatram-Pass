import prisma from "../../lib/prisma.js";

export async function logAudit({ actorId, action, entity, entityId, meta }) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorId: actorId || null,
        action,
        entity: entity || null,
        entityId: entityId || null,
        meta: meta ? meta : undefined,
      },
    });
  } catch (error) {
    console.error('Failed to log audit activity:', error);
  }
}

export default { logAudit };

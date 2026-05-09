import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function writeAudit(params: {
  adminUserId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: unknown;
}) {
  await prisma.adminAuditLog.create({
    data: {
      adminUserId: params.adminUserId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
    },
  });
}

export function isAdmin(role: UserRole) {
  return role === UserRole.ADMIN;
}

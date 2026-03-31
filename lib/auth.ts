import { createHash } from 'node:crypto';
import { prisma } from './prisma';

export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export async function resolveUserByEmailHeader(email: string | null) {
  if (!email) return null;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const techniques = await prisma.technique.findMany({ select: { id: true } });
  for (const technique of techniques) {
    await prisma.userTechnique.upsert({
      where: { userId_techniqueId: { userId: user.id, techniqueId: technique.id } },
      update: {},
      create: { userId: user.id, techniqueId: technique.id, masteryScore: 0.3 }
    });
  }

  return user;
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashPassword(password)
    }
  });

  const techniques = await prisma.technique.findMany();
  for (const technique of techniques) {
    await prisma.userTechnique.create({
      data: { userId: user.id, techniqueId: technique.id }
    });
  }

  return NextResponse.json({ email: user.email });
}

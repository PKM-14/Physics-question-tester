import { FailureType } from '@prisma/client';
import { NextResponse } from 'next/server';
import { resolveUserByEmailHeader } from '@/lib/auth';
import { submitAttempt } from '@/lib/adaptive';

export async function POST(request: Request) {
  const email = request.headers.get('x-user-email');
  const user = await resolveUserByEmailHeader(email);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: send x-user-email header' }, { status: 401 });
  }

  const body = await request.json();
  const correct = Boolean(body.correct);
  const failureType = body.failureType as FailureType | undefined;

  if (!correct && !failureType) {
    return NextResponse.json({ error: 'failureType is required for incorrect attempts' }, { status: 400 });
  }

  const attempt = await submitAttempt({
    userId: user.id,
    problemId: Number(body.problemId),
    correct,
    failureType,
    timeTaken: Number(body.timeTaken ?? 0)
  });

  return NextResponse.json({ attemptId: attempt.id });
}

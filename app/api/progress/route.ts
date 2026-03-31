import { NextResponse } from 'next/server';
import { resolveUserByEmailHeader } from '@/lib/auth';
import { getProgress } from '@/lib/adaptive';

export async function GET(request: Request) {
  const email = request.headers.get('x-user-email');
  const user = await resolveUserByEmailHeader(email);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: send x-user-email header' }, { status: 401 });
  }

  const progress = await getProgress(user.id);
  return NextResponse.json(progress);
}

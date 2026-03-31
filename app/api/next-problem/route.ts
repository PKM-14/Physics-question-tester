import { NextResponse } from 'next/server';
import { getNextProblem } from '@/lib/adaptive';
import { resolveUserByEmailHeader } from '@/lib/auth';

export async function GET(request: Request) {
  const email = request.headers.get('x-user-email');
  const user = await resolveUserByEmailHeader(email);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: send x-user-email header' }, { status: 401 });
  }

  const data = await getNextProblem(user.id);
  if (!data || !data.problem) {
    return NextResponse.json({ error: 'No available problems' }, { status: 404 });
  }

  return NextResponse.json(data);
}

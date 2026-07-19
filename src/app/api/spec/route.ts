import { getStore } from '@/server/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const store = getStore();
  return Response.json({ rows: store.specRows });
}

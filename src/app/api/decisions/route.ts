import { getStore } from '@/server/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const store = getStore();
  const decisions = [...store.decisions.values()];
  const findings = Object.fromEntries(store.findings.map((f) => [f.id, f]));
  return Response.json({ user: store.user, decisions, findings });
}

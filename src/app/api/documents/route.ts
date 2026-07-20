import { NextResponse } from 'next/server';
import { getStore } from '@/server/store';

export async function GET() {
  const store = getStore();
  return NextResponse.json({ documents: store.documents });
}

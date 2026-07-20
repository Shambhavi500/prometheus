import { NextResponse } from 'next/server';
import { getStore, deleteDocument } from '@/server/store';

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  deleteDocument(id);
  return NextResponse.json({ success: true });
}
